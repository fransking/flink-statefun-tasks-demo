from statefun_tasks import FlinkTasks
from kafka import KafkaProducer
import logging
import json


_log = logging.getLogger(__name__)


class Events(object):
    def __init__(self, kakfa_url: str, events_topic: str):
        self._kakfa_url = kakfa_url
        self._events_topic = events_topic
        
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

            producer.send(topic=self._events_topic, value=msg)
