FROM python:3.10-slim

RUN mkdir /app

COPY requirements.txt /app
RUN pip install -r /app/requirements.txt

COPY py_files/ /app/py_files/
COPY website/dist/ /app/website/
COPY website/assets/ /app/website/assets/

ENV KAFKA_URL=kafka:9092
ENV KAFKA_REQUEST_INGRESS_TOPIC=statefun.tasks.demo.requests
ENV KAFKA_ACTION_INGRESS_TOPIC=statefun.tasks.demo.actions
ENV KAFKA_REPLY_TOPIC=statefun.tasks.demo.reply
ENV KAFKA_EVENTS_TOPIC=statefun.tasks.demo.events
ENV FLINK_WORKER_NAMESPACE=demo
ENV FLINK_WORKER_NAME=worker
ENV FLINK_EGRESS_TYPE_NAME=demo/kafka-generic-egress
ENV FLINK_STATE_EXPIRATION_TIME_MINUTES=1440
ENV WEBSITE_DIR=/app/website/

WORKDIR /app

EXPOSE 8082
EXPOSE 8085

COPY entrypoint.sh /app

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["server"]
