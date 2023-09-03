#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:1.1.1 .
docker image inspect fransking/flink-demo-app:1.1.1 --format='{{.Size}}'
