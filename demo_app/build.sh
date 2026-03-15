#!/bin/bash

npm i
npm run build
docker build -t fransking/flink-demo-app:3.4.1 .
docker image inspect fransking/flink-demo-app:3.4.1 --format='{{.Size}}'
