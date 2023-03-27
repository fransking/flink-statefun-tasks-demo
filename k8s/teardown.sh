#!/bin/sh

microk8s kubectl --namespace=flink-statefun-tasks-demo delete services --all
microk8s kubectl --namespace=flink-statefun-tasks-demo delete deployments --all
microk8s kubectl --namespace=flink-statefun-tasks-demo delete ingress --all
