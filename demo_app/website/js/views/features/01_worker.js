import React from 'react';
import Feature from '../../components/Feature'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Worker">
          <Feature.Blurb>
          Create a <a href="https://fransking.github.io/flink-statefun-tasks/api/generated/statefun_tasks.FlinkTasks.html" target="_blank">FlinkTasks</a> object 
          matching the set up in <a href="https://github.com/fransking/flink-statefun-tasks-demo/blob/main/k8s/03-flink.yaml" target="_blank">module.yaml</a>.
          Stateful Tasks uses one remote function definition (e.g. demo/worker/task_id) to run several tasks.
          See the <a href="https://nightlies.apache.org/flink/flink-statefun-docs-release-3.2/">Flink documentation</a> for more information about function namespaces, types and identifiers.
          </Feature.Blurb>
          <Feature.Code>

  {
  `
  from statefun_tasks import FlinkTasks

  tasks = FlinkTasks(
    default_namespace='demo', 
    default_worker_name='worker', 
    egress_type_name='demo/kafka-generic-egress'
  )
  `
  }
          </Feature.Code>
      </Feature>
      <div className="container col-xxl-10 px-4"><hr></hr></div>
    </div>
  );
};