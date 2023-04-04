from statefun_tasks.client import FlinkTasksClientFactory


def create_flink_client(kafka_broker_url):
    return FlinkTasksClientFactory.get_client(
        kafka_broker_url=kafka_broker_url, 
        request_topics={None: 'statefun.tasks.demo.requests'}, 
        action_topics={None: 'statefun.tasks.demo.actions'}, 
        reply_topic=f'statefun.tasks.demo.reply'
    )
