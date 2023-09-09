#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:1.1.2 .
docker image inspect fransking/flink-demo-app:1.1.2 --format='{{.Size}}'
