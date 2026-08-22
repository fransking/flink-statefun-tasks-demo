#!/bin/bash

npm i
npm run build
docker build -t fransking/flink-demo-app:3.5.0 .
docker tag fransking/flink-demo-app:3.5.0 fransking/flink-demo-app:latest
docker image inspect fransking/flink-demo-app:3.5.0 --format='{{.Size}}'
