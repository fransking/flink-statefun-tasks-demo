from py_files import WebSockets
from py_files.api import router
from py_files.tasks import tasks
from py_files.tasks import enable_inline_tasks

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

import sys
import os
import logging


_log = logging.getLogger(__name__)

kafka_events_topic = os.environ.get('KAFKA_EVENTS_TOPIC', 'statefun.tasks.demo.events')
kafka_url = os.environ.get('KAFKA_URL', 'kafka:30092')
website_dir = os.environ.get('WEBSITE_DIR', 'website/dist')

web_sockets = WebSockets(kafka_url, kafka_events_topic, kafka_fetch_max_bytes=52428800)


@asynccontextmanager
async def lifespan(app: FastAPI):
    enable_inline_tasks(tasks)
    await web_sockets.start()
    yield
    await web_sockets.stop()


def _configure_logging(level):
    log = logging.getLogger()
    log.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    formatter = logging.Formatter('%(asctime)s: %(levelname)s - %(name)s - %(message)s')
    handler.setFormatter(formatter)
    log.addHandler(handler)


_configure_logging(logging.INFO)
_log.info("Starting Demo App")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(router)
app.include_router(web_sockets.router)


@app.get("/", response_class=HTMLResponse)
async def root_handler():
    with open(os.path.join(website_dir, 'index.html')) as f:
        return f.read()


app.mount("/", StaticFiles(directory=website_dir), name="static")
