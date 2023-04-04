#!/bin/sh

docker stop flink-demo-app
docker rm flink-demo-app

docker stop flink-demo-app-worker
docker rm flink-demo-app-worker
