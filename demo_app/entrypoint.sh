#!/bin/sh
set -e
ulimit -n 65536

if [ "$1" = 'server' ]; then
    exec gunicorn -b "0.0.0.0:8082" -w 2 py_files.server:app --worker-class aiohttp.GunicornWebWorker
elif  [ "$1" = 'worker' ]; then
    exec gunicorn -b "0.0.0.0:8085" -w 8 "py_files.worker:app($2)" --worker-class aiohttp.GunicornWebWorker
fi

exec "$@"