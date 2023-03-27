#!/bin/sh

docker stop flink-demo-app
docker rm flink-demo-app
docker run \
    -p 8082:8082 \
    --name flink-demo-app \
    fransking/flink-demo-app:latest
