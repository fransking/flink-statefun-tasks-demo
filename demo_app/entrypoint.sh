#!/bin/sh
set -e

if [ "$1" = 'gunicorn' ]; then
    exec gunicorn -b "0.0.0.0:8082" -w 1 py_files.server:app --worker-class aiohttp.GunicornWebWorker
fi

exec "$@"