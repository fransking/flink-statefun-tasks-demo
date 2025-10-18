from py_files.tasks import tasks
from py_files.tasks import default_namespace
from py_files.tasks import default_worker_name
from py_files.tasks import Events
from py_files.tasks import enable_inline_tasks

from statefun_tasks.core.statefun import StatefulFunctions
from statefun_tasks.core.statefun import RequestReplyHandler
from aiohttp import web
import sys
import os
import traceback
import logging


_log = logging.getLogger(__name__)


kakfa_url = os.environ.get('KAFKA_URL', 'kafka:30092')
kafka_events_topic = os.environ.get('KAFKA_EVENTS_TOPIC', 'statefun.tasks.demo.events')

routes = web.RouteTableDef()
functions = StatefulFunctions()
handler = RequestReplyHandler(functions)

@functions.bind(f'{default_namespace}/{default_worker_name}', specs=tasks.value_specs())
async def worker(context, message):
    try:
        await tasks.run_async(context, message)
    except Exception as e:
        print(f'Error - {e}')
        traceback.print_exc()


@routes.post('/')
async def handle(request):
    handler = RequestReplyHandler(functions)
    request_data = await request.read()
    response_data = await handler.handle_async(request_data)
    return web.Response(body=response_data, content_type='application/octet-stream')


def app(inline_tasks_enabled=False):

    _configure_logging(logging.INFO)
    _log.info("Starting Demo App Worker")

    events = Events(kakfa_url, kafka_events_topic)
    events.start(tasks)

    web_app = web.Application(client_max_size=104857600)  # 100 MB
    web_app.add_routes(routes)

    if inline_tasks_enabled:
        enable_inline_tasks(tasks)

    return web_app


def _configure_logging(level):
    log = logging.getLogger()
    log.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    formatter = logging.Formatter('%(asctime)s: %(levelname)s - %(name)s - %(message)s')
    handler.setFormatter(formatter)
    log.addHandler(handler)
