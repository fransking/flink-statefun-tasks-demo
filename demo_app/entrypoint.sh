#!/bin/sh
set -e
ulimit -n 65536

if [ "$1" = 'server' ]; then
    exec uvicorn py_files.server:app --host 0.0.0.0 --port 8082 --workers 2
elif  [ "$1" = 'worker' ]; then
    if [ -n "${2:-}" ]; then
        export INLINE_TASKS_ENABLED="$2"
    fi
    exec uvicorn py_files.worker:app --host 0.0.0.0 --port 8085 --workers 8
fi

exec "$@"