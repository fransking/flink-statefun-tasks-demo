import React from 'react';
import Feature from '../../components/Feature'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Client">
        <Feature.Blurb>
          Create a <a href="https://fransking.github.io/flink-statefun-tasks/api/generated/statefun_tasks.client.FlinkTasksClientFactory.html#statefun_tasks.client.FlinkTasksClientFactory" target="_blank">FlinkTasksClient</a> matching 
          the ingress configuation in <a href="https://github.com/fransking/flink-statefun-tasks-demo/blob/main/k8s/03-flink.yaml" target="_blank">module.yaml</a>.
        </Feature.Blurb>
        <Feature.Code>
{
`
from statefun_tasks.client import FlinkTasksClientFactory

flink_client = FlinkTasksClientFactory.get_client(
  kafka_broker_url=kafka:9092, 
  request_topics={None: 'statefun.tasks.demo.requests'}, 
  action_topics={None: 'statefun.tasks.demo.actions'}, 
  reply_topic='statefun.tasks.demo.reply'
)
`
}
        </Feature.Code>
      </Feature>
      <div className="container col-xxl-10 px-4"><hr></hr></div>
    </div>
  );
};