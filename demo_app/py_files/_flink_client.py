from statefun_tasks.client import FlinkTasksClientFactory


def create_flink_client(kafka_broker_url, request_topic, action_topic, reply_topic):
    return FlinkTasksClientFactory.get_client(
        kafka_broker_url=kafka_broker_url, 
        request_topics={None: request_topic}, 
        action_topics={None: action_topic}, 
        reply_topic=reply_topic
    )
