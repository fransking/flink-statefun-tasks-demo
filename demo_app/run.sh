#!/bin/sh

docker stop flink-demo-app-server
docker rm flink-demo-app-server
docker run \
    -d \
    -e KAFKA_URL=kafka:30092 \
    -e KAFKA_REQUEST_INGRESS_TOPIC=statefun.tasks.demo.requests \
    -e KAFKA_ACTION_INGRESS_TOPIC=statefun.tasks.demo.actions \
    -e FLINK_WORKER_NAMESPACE=external \
    -e FLINK_WORKER_NAME=worker \
    -e KAFKA_URL=kafka:30092 \
    -p 8082:8082 \
    --name flink-demo-app-server \
    fransking/flink-demo-app:latest \
    server


docker stop flink-demo-app-worker
docker rm flink-demo-app-worker
docker run \
    -d \
    -e KAFKA_URL=kafka:30092 \
    -e FLINK_WORKER_NAMESPACE=external \
    -e FLINK_WORKER_NAME=worker \
    -p 8085:8085 \
    --name flink-demo-app-worker \
    fransking/flink-demo-app:latest \
    worker
