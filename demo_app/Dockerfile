FROM python:3.10-slim

RUN mkdir /app

COPY requirements.txt /app
RUN pip install -r /app/requirements.txt

COPY py_files/ /app/py_files/
COPY website/dist/ /app/website/

ENV KAFKA_URL=kafka:9092
ENV KAFKA_REQUEST_INGRESS_TOPIC=statefun.tasks.demo.requests
ENV KAFKA_ACTION_INGRESS_TOPIC=statefun.tasks.demo.actions
ENV KAFKA_REPLY_TOPIC=statefun.tasks.demo.reply
ENV KAFKA_WEB_SOCKETS_TOPIC=statefun.tasks.demo.websockets
ENV FLINK_WORKER_NAMESPACE=demo
ENV FLINK_WORKER_NAME=worker
ENV FLINK_EGRESS_TYPE_NAME=demo/kafka-generic-egress
ENV WEBSITE_DIR=/app/website/

WORKDIR /app

EXPOSE 8082
EXPOSE 8085

COPY entrypoint.sh /app

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["server"]
