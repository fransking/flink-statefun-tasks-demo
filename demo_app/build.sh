#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:1.0.0 .
docker image inspect fransking/flink-demo-app:1.0.0 --format='{{.Size}}'
