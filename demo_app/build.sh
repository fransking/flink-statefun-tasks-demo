#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app .
docker image inspect fransking/flink-demo-app:latest --format='{{.Size}}'
