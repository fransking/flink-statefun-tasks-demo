#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:1.0-rc1 .
docker image inspect fransking/flink-demo-app:1.0-rc1 --format='{{.Size}}'
