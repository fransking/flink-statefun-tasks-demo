from py_files.tasks import tasks
from py_files.tasks import default_namespace
from py_files.tasks import default_worker_name
from py_files.tasks import Events
from py_files.tasks import enable_inline_tasks

from statefun_tasks.core.statefun import StatefulFunctions
from statefun_tasks.core.statefun import RequestReplyHandler
from fastapi import FastAPI, Request
from fastapi.responses import Response
import sys
import os
import traceback
import logging


_log = logging.getLogger(__name__)


kakfa_url = os.environ.get('KAFKA_URL', 'kafka:30092')
kafka_events_topic = os.environ.get('KAFKA_EVENTS_TOPIC', 'statefun.tasks.demo.events')
inline_tasks_enabled = os.environ.get('INLINE_TASKS_ENABLED', '').lower() in ('true', '1', 'yes')

functions = StatefulFunctions()
handler = RequestReplyHandler(functions)

@functions.bind(f'{default_namespace}/{default_worker_name}', specs=tasks.value_specs())
async def worker(context, message):
    try:
        await tasks.run_async(context, message)
    except Exception as e:
        print(f'Error - {e}')
        traceback.print_exc()


def _configure_logging(level):
    log = logging.getLogger()
    log.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    formatter = logging.Formatter('%(asctime)s: %(levelname)s - %(name)s - %(message)s')
    handler.setFormatter(formatter)
    log.addHandler(handler)


_configure_logging(logging.INFO)
_log.info("Starting Demo App Worker")

events = Events(kakfa_url, kafka_events_topic)
events.start(tasks)

if inline_tasks_enabled:
    enable_inline_tasks(tasks)

app = FastAPI()


@app.post('/')
async def handle(request: Request):
    request_data = await request.body()
    response_data = await handler.handle_async(request_data)
    return Response(content=response_data, media_type='application/octet-stream')
