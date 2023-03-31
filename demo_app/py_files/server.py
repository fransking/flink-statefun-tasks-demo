from py_files import WebSockets

from aiohttp import web
import sys
import logging


_log = logging.getLogger(__name__)


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

    web_sockets = WebSockets(web_app)
    web_sockets.start()

    web_app.add_routes([web.static('/', 'website')])

    return web_app


def _configure_logging(level):
    log = logging.getLogger()
    log.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    formatter = logging.Formatter('%(asctime)s: %(levelname)s - %(name)s - %(message)s')
    handler.setFormatter(formatter)
    log.addHandler(handler)