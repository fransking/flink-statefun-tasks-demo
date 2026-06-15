#!/bin/bash

npm i
npm run build
docker build -t fransking/flink-demo-app:3.4.5 .
docker tag fransking/flink-demo-app:3.4.5 fransking/flink-demo-app:latest
docker image inspect fransking/flink-demo-app:3.4.5 --format='{{.Size}}'
