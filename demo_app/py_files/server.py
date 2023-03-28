from aiohttp import web


routes = web.RouteTableDef()


@routes.get('/')
async def root_handler(request):
    with open('website/index.html') as f:
        return web.Response(body=f.read(), content_type='text/html')


async def app():
    web_app = web.Application()
    web_app.add_routes(routes)
    web_app.add_routes([web.static('/', 'website')])
    return web_app
