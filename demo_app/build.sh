#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:1.2.0 .
docker image inspect fransking/flink-demo-app:1.2.0 --format='{{.Size}}'
