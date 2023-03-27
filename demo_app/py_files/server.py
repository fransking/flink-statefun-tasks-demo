from aiohttp import web


routes = web.RouteTableDef()


@routes.get('/')
async def hello(request):
    return web.Response(text="Hello, world")


async def app():
    web_app = web.Application()
    web_app.add_routes(routes)
    return web_app
