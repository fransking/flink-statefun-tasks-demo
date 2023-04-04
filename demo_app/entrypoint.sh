#!/bin/sh
set -e

if [ "$1" = 'server' ]; then
    exec gunicorn -b "0.0.0.0:8082" -w 1 py_files.server:app --worker-class aiohttp.GunicornWebWorker
elif  [ "$1" = 'worker' ]; then
    exec gunicorn -b "0.0.0.0:8085" -w 1 py_files.worker:app --worker-class aiohttp.GunicornWebWorker
fi

exec "$@"