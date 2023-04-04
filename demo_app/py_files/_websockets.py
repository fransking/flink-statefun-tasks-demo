from aiohttp import web
from aiohttp import WSMsgType
from weakref import WeakSet
from weakref import WeakKeyDictionary
from kafka import KafkaConsumer
from threading import Thread
import asyncio
import json
import logging


_log = logging.getLogger(__name__)


class WebSockets():
    def __init__(self, app: web.Application, kakfa_url: str, kakfa_web_sockets_topic: str):
        # Web socket server for clients to connect to
        self._app = app
        self._connections = WeakSet()
        self._subscriptions = WeakKeyDictionary()
        self._app.on_shutdown.append(lambda _: self.stop())
        self._loop = None
        
        # Kafka consumer listening for events and broadcasting to interested web socket clients
        self._kakfa_web_sockets_topic = kakfa_web_sockets_topic

        self._consumer = KafkaConsumer(
            kakfa_web_sockets_topic,
            bootstrap_servers=kakfa_url,
            auto_offset_reset='latest'
        )

        self._consumer_thread = Thread(target=self._handle_kafka_message, args=())
        self._consumer_thread.daemon = True

    async def start(self):
        self._loop = asyncio.get_event_loop()
        self._consumer_thread.start()
        _log.info('Started web socket kafka consumer')

        self._app.add_routes([web.get('/ws', self._handle_request)])
        _log.info('Started web socket server at /ws')

    async def stop(self):
        _log.info("Web socket server shutting down")
        await asyncio.gather(*[ws.close() for ws in self._connections], return_exceptions=True)

    async def _handle_request(self, request):
        source_ip = request.remote
        _log.info(f'Web socket connection from {source_ip}')

        ws = web.WebSocketResponse()
        await ws.prepare(request)

        self._connections.add(ws)

        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                if msg.data == 'CLOSE':
                    await ws.close()
                else:
                    self._try_handle_message(ws, source_ip, msg.data)

        _log.info(f'Web socket connection from {source_ip} closed')

        return ws

    def _try_handle_message(self, ws, source_ip, data):
        try:
            self._handle_message(ws, source_ip, data)
        except Exception as e:
            _log.error(f'Error handling web socket message - {e}', e)

    def _handle_message(self, ws, source_ip, data):
        request = json.loads(data)

        if request['action'] == 'WS_SUBSCRIBE':
            subscriptions = self._subscriptions.setdefault(ws, set())
            subscriptions.add(request["topic"])
            _log.info(f'{source_ip} subscribed to {request["topic"]}')

        elif request['action'] == 'WS_UNSUBSCRIBE':
            subscriptions = self._subscriptions.setdefault(ws, set())
            subscriptions.discard(request["topic"])

            _log.info(f'{source_ip} unsubscribed from {request["topic"]}')

    def _handle_kafka_message(self):
        while True:
            try:
                for message in self._consumer:
                    _log.debug(f'Message received - {message}')

                    data = json.loads(message.value)
                    topic = data['topic']
                    publishings = []

                    for subscriber, subscriptions in self._subscriptions.items():
                        if topic in subscriptions:
                            publishings.append(subscriber.send_json(data))

                    async def send(items):
                        await asyncio.gather(*items, return_exceptions=True)

                    asyncio.run_coroutine_threadsafe(send(list(publishings)), loop=self._loop)

            except Exception as ex:
                _log.warning(f'Error in websocket kafka consumer thread - {ex}', exc_info=ex)
