from statefun_tasks import FlinkTasks
from statefun_tasks import Group
from kafka import KafkaProducer
import logging
import json


_log = logging.getLogger(__name__)


class Events(object):
    def __init__(self, kakfa_url: str, kakfa_web_sockets_topic: str):
        self._kakfa_url = kakfa_url
        self._kakfa_web_sockets_topic = kakfa_web_sockets_topic
        
    def start(self, tasks: FlinkTasks):
        _log.info('Starting web socket events')

        producer = KafkaProducer(bootstrap_servers=self._kakfa_url, value_serializer=lambda x: json.dumps(x).encode('utf-8'))

        @tasks.events.on_task_finished
        def on_task_finished(context, task_result=None, task_exception=None, is_pipeline=False):
            root_pipeline_id = context.get_root_pipeline_id() or context.get_task_id()

            msg = {
                'topic': f'task_events.{root_pipeline_id}',
                'root_pipeline_id': root_pipeline_id,
                'task_id': context.get_task_id(),
                'type': 'TASK_FINISHED',
                'status': 'COMPLETED' if task_result is not None else 'FAILED'
            }
            
            producer.send(topic=self._kakfa_web_sockets_topic, value=msg)

        @tasks.events.on_pipeline_finished
        def on_pipeline_finished(context, pipeline, task_result=None, task_exception=None):
            root_pipeline_id = context.get_root_pipeline_id() or context.get_task_id()

            msg = {
                'topic': f'task_events.{root_pipeline_id}',
                'root_pipeline_id': root_pipeline_id,
                'pipeline_id': context.get_task_id(),
                'type': 'PIPELINE_FINISHED',
                'status': 'COMPLETED' if task_result is not None else 'FAILED'
            }
            
            producer.send(topic=self._kakfa_web_sockets_topic, value=msg)

        @tasks.events.on_pipeline_created
        def on_pipeline_created(context, pipeline):
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


            walk_graph(pipeline, pipeline_tasks)
            
            root_pipeline_id = context.get_root_pipeline_id() or context.get_task_id()

            msg = {
                'topic': f'task_events.{root_pipeline_id}',
                'root_pipeline_id': root_pipeline_id,
                'pipeline_id': context.get_task_id(),
                'type': 'PIPELINE_CREATED',
                'data': pipeline_tasks
            }
            
            producer.send(topic=self._kakfa_web_sockets_topic, value=msg)
