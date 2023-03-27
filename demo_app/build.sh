#!/bin/bash

docker build -t fransking/flink-demo-app .
docker image inspect fransking/flink-demo-app:latest --format='{{.Size}}'