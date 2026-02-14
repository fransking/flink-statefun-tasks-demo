#!/bin/bash

npm run build
docker build -t fransking/flink-demo-app:3.4.0 .
docker image inspect fransking/flink-demo-app:3.4.0 --format='{{.Size}}'
