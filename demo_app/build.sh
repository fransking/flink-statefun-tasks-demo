#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:1.2.4 .
docker image inspect fransking/flink-demo-app:1.2.4 --format='{{.Size}}'
