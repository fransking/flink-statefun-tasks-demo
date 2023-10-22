FROM fransking/flink-statefun:3.3.0

RUN set -ex; \
    apt-get update; \
    apt-get install --only-upgrade wget

RUN echo "execution.buffer-timeout: 10 ms" >> /opt/flink/conf/flink-conf.yaml
RUN echo "taskmanager.memory.task.off-heap.size: 512mb" >> /opt/flink/conf/flink-conf.yaml
RUN echo "statefun.async.max-per-task: 10240" >> /opt/flink/conf/flink-conf.yaml

RUN echo "taskmanager.numberOfTaskSlots: 2" >> /opt/flink/conf/flink-conf.yaml
RUN echo "parallelism.default: 2" >> /opt/flink/conf/flink-conf.yaml

RUN mkdir -p /opt/statefun/modules/tasks
ADD module.yaml /opt/statefun/modules/tasks

RUN mkdir -p /opt/statefun/modules/embedded
RUN wget https://github.com/fransking/flink-statefun-tasks-embedded/releases/download/1.2.0/statefun-tasks-distribution-1.2.0.jar -P /opt/statefun/modules/embedded/
