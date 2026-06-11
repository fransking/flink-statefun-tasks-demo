FROM fransking/flink-statefun-tasks:3.4.4

RUN set -ex; \
    apt-get update; \
    apt-get install --only-upgrade wget

RUN echo "execution.buffer-timeout: 10 ms" >> /opt/flink/conf/config.yaml
RUN echo "taskmanager.memory.task.off-heap.size: 512mb" >> /opt/flink/conf/config.yaml
RUN echo "statefun.async.max-per-task: 10240" >> /opt/flink/conf/config.yaml

RUN echo "taskmanager.numberOfTaskSlots: 2" >> /opt/flink/conf/config.yaml
RUN echo "parallelism.default: 2" >> /opt/flink/conf/config.yaml

RUN mkdir -p /opt/statefun/modules/tasks
ADD module.yaml /opt/statefun/modules/tasks
