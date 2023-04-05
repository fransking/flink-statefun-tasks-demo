#!/bin/sh

docker stop flink-demo-app-server
docker rm flink-demo-app-server

docker stop flink-demo-app-worker
docker rm flink-demo-app-worker
