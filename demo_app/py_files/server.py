from py_files import WebSockets
from py_files.api import api_routes
from py_files.tasks import tasks
from py_files.tasks import enable_inline_tasks

from aiohttp import web
import aiohttp_cors

import sys
import os
import logging


_log = logging.getLogger(__name__)

kafka_web_sockets_topic = os.environ.get('KAFKA_WEB_SOCKETS_TOPIC', 'statefun.tasks.demo.websockets')
kafka_url = os.environ.get('KAFKA_URL', 'kafka:30092')
website_dir = os.environ.get('WEBSITE_DIR', 'website/dist')

routes = web.RouteTableDef()


@routes.get('/')
async def root_handler(request):
    with open('website/index.html') as f:
        return web.Response(body=f.read(), content_type='text/html')


async def app():
    _configure_logging(logging.INFO)
    _log.info("Starting Demo App")

    web_app = web.Application()
    web_app.add_routes(routes)
    web_app.add_routes(api_routes)

    web_sockets = WebSockets(web_app, kafka_url, kafka_web_sockets_topic)
    await web_sockets.start()

    web_app.add_routes([web.static('/', website_dir)])

    cors_defaults = {"*": aiohttp_cors.ResourceOptions(allow_credentials=True, expose_headers="*", allow_headers="*")}
    cors = aiohttp_cors.setup(web_app, defaults=cors_defaults)

    for route in list(web_app.router.routes()):
        cors.add(route)

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
