from statefun_tasks.messages_pb2 import Event, TaskStatus
from google.protobuf.any_pb2 import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from kafka import KafkaConsumer
from threading import Thread
import asyncio
import json
import logging


_log = logging.getLogger(__name__)


class WebSockets():
    def __init__(self, kakfa_url: str, kafka_events_topic: str, kafka_fetch_max_bytes=1048576):
        # Web socket server for clients to connect to
        self._connections = set()
        self._subscriptions = {}
        self._loop = None
        
        self.router = APIRouter()
        self.router.add_api_websocket_route('/ws', self._handle_request)

        # Kafka consumer listening for events and broadcasting to interested web socket clients
        self._kafka_events_topic = kafka_events_topic

        kafka_props = {
            'fetch_max_bytes': kafka_fetch_max_bytes
        }

        self._consumer = KafkaConsumer(
            kafka_events_topic,
            bootstrap_servers=kakfa_url,
            auto_offset_reset='latest',
            **kafka_props
        )

        self._consumer_thread = Thread(target=self._handle_kafka_message, args=())
        self._consumer_thread.daemon = True

    async def start(self):
        self._loop = asyncio.get_event_loop()

        self._consumer_thread.start()
        _log.info('Started web socket kafka consumer')
        _log.info('Started web socket server at /ws')

    async def stop(self):
        _log.info("Web socket server shutting down")
        for ws in list(self._connections):
            try:
                await ws.close()
            except Exception:
                pass

    async def _handle_request(self, websocket: WebSocket):
        source_ip = websocket.client.host if websocket.client else "unknown"
        _log.info(f'Web socket connection from {source_ip}')

        await websocket.accept()
        self._connections.add(websocket)

        try:
            while True:
                data = await websocket.receive_text()
                if data == 'CLOSE':
                    await websocket.close()
                    break
                await self._try_handle_message(websocket, source_ip, data)
        except WebSocketDisconnect:
            pass
        finally:
            self._connections.discard(websocket)
            self._subscriptions.pop(websocket, None)
            _log.info(f'Web socket connection from {source_ip} closed')

    async def _try_handle_message(self, ws, source_ip, data):
        try:
            await self._handle_message(ws, source_ip, data)
        except Exception as e:
            _log.error(f'Error handling web socket message - {e}', e)

    async def _handle_message(self, ws, source_ip, data):
        request = json.loads(data)

        # subscribe to a topic
        if request['action'] == 'WS_SUBSCRIBE':
            subscriptions = self._subscriptions.setdefault(ws, set())
            subscriptions.add(request['topic'])
            _log.info(f'{source_ip} subscribed to {request["topic"]}')

            # let client know that subscription was successful
            await ws.send_json({'type': 'WS_SUBSCRIBED', 'topic': request['topic']})

        # unsubscribe from a topic
        elif request['action'] == 'WS_UNSUBSCRIBE':
            subscriptions = self._subscriptions.setdefault(ws, set())
            subscriptions.discard(request['topic'])

        # ping -> pong keepalive
        elif request['action'] == 'PING':
            _log.debug(f'ping from {source_ip}')
            await ws.send_json({'action': 'PONG'})

    def _handle_kafka_message(self):
        while True:
            try:
                for message in self._consumer:
                    _log.debug(f'Message received - {message}')

                    publishings = []
                    for data in self._extract_event_message(message):
                        topic = data['topic']
                        
                        for subscriber, subscriptions in self._subscriptions.items():
                            if topic in subscriptions:
                                publishings.append(subscriber.send_json(data))

                    async def send(items):
                        await asyncio.gather(*items, return_exceptions=True)

                    asyncio.run_coroutine_threadsafe(send(list(publishings)), loop=self._loop)

            except Exception as ex:
                _log.warning(f'Error in websocket kafka consumer thread - {ex}', exc_info=ex)

    def _extract_event_message(self, message):
        try:
            return [json.loads(message.value)]
        except:
            proto = Any()
            proto.ParseFromString(message.value)
            
            event = Event()
            proto.Unpack(event)

            if event.HasField('pipeline_created'):
                return self._extract_on_pipeline_created(event)

            if event.HasField('pipeline_status_changed'):
                return self._extract_on_pipeline_status_changed(event)

            if event.HasField('pipeline_tasks_skipped'):
                return self._extract_pipeline_tasks_skipped(event)

            return []

    @staticmethod 
    def _extract_on_pipeline_created(event):
        pipeline_tasks = []

        def walk_graph(pipeline_entry, tasks):
            for entry in pipeline_entry.entries:
                if entry.HasField('group_entry'):
                    group = {'type': 'group', 'id': entry.group_entry.group_id, 'tasks': []}
                    
                    for group_entry in entry.group_entry.group:
                        chain = []
                        walk_graph(group_entry, chain)
                        group['tasks'].append(chain)
                    
                    tasks.append(group)

                else:
                    tasks.append({'type': 'task', 'id': entry.task_entry.task_id})


        walk_graph(event.pipeline_created.pipeline, pipeline_tasks)

        msg = {
            'topic': f'task_events.{event.root_pipeline_id}',
            'root_pipeline_id': event.root_pipeline_id,
            'pipeline_id': event.pipeline_id,
            'type': 'PIPELINE_CREATED',
            'data': pipeline_tasks
        }

        return [msg]
    
    @staticmethod
    def _extract_on_pipeline_status_changed(event):
        msg = {
            'topic': f'task_events.{event.root_pipeline_id}',
            'root_pipeline_id': event.root_pipeline_id,
            'pipeline_id': event.pipeline_id,
            'type': 'PIPELINE_STATUS',
            'status': TaskStatus.Status.Name(event.pipeline_status_changed.status.value)
        }

        return [msg]

    @staticmethod
    def _extract_pipeline_tasks_skipped(event):
        for task in event.pipeline_tasks_skipped.tasks:
            msg = {
                'topic': f'task_events.{event.root_pipeline_id}',
                'root_pipeline_id': event.root_pipeline_id,
                'pipeline_id': event.pipeline_id,
                'type': 'TASK_SKIPPED',
                'task_id': task.task_id
            }

            yield msg
