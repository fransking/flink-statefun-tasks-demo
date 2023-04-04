#!/bin/sh

docker stop flink-demo-app
docker rm flink-demo-app
docker run \
    -d \
    -e KAFKA_URL=kafka:30092 \
    -p 8082:8082 \
    --name flink-demo-app \
    fransking/flink-demo-app:latest \
    server


docker stop flink-demo-app-worker
docker rm flink-demo-app-worker
docker run \
    -d \
    -p 8085:8082 \
    --name flink-demo-app-worker \
    fransking/flink-demo-app:latest \
    worker
