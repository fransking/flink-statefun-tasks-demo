#!/bin/bash

npm i
npm run build
docker build -t fransking/flink-demo-app:3.4.3rc0 .
docker image inspect fransking/flink-demo-app:3.4.3rc0 --format='{{.Size}}'
