import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import Feature from '../components/Feature'
import { wsSubscribe } from '../utils/webSockets'

export default function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    wsSubscribe(dispatch, "task_events", null)
  });

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-shrink-0">
            <div className="px-4 py-5 my-5 text-center">
              <h1 className="display-5 fw-bold">Stateful Tasks and Workflows on Apache Flink</h1>
              <div className="col-lg-6 mx-auto">
                <p className="lead mb-4">Write simple Python functions and deploy them as stateful tasks that can be chained together into workflows, making full use of Flink's state management, orchestration and fault tolerance.</p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <a href="https://github.com/fransking/flink-statefun-tasks" target="_blank" className="btn btn-outline-primary btn-lg px-4">View on Github</a>
                  <a href="https://fransking.github.io/flink-statefun-tasks/" target="_blank" className="btn btn-outline-secondary btn-lg px-4">Read the docs</a>
                  <a href="https://github.com/fransking/flink-statefun-tasks-demo" target="_blank" className="btn btn-outline-secondary btn-lg px-4">Get the demo</a>
                </div>
              </div>
            </div>
            
            <div className="b-example-divider"></div>

            <Feature title="On the worker...">
              <Feature.Blurb>
                Create a <a href="https://fransking.github.io/flink-statefun-tasks/api/generated/statefun_tasks.FlinkTasks.html" target="_blank">FlinkTasks</a> object 
                matching the set up in <a href="https://github.com/fransking/flink-statefun-tasks-demo/blob/main/k8s/03-flink.yaml" target="_blank">module.yaml</a>.
                Stateful Tasks use one remote function definition (e.g. demo/worker/task_id) to run several tasks.
                See the <a href="https://nightlies.apache.org/flink/flink-statefun-docs-release-3.2/">Flink documentation</a> for more information about function namespaces, types and identifiers.
              </Feature.Blurb>
              <Feature.Code>
{
`
from statefun_tasks import FlinkTasks

tasks = FlinkTasks(
default_namespace="demo", 
default_worker_name="worker", 
egress_type_name="demo/kafka-generic-egress"
)
`
}
              </Feature.Code>
            </Feature>

            <Feature title="On the client...">
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
reply_topic=f'statefun.tasks.demo.reply'
)
`
}
              </Feature.Code>
            </Feature>

            <div className="b-example-divider"></div>

            <Feature title="Creating a task">
              <Feature.Blurb>
                Tasks are declared on the worker using <b>@tasks.bind</b> and they remain ordinary Python functions that can be called directly.
              </Feature.Blurb>
              <Feature.Code>
{
`
@tasks.bind()
def multiply(a, b):
return a * b

print(multiply(3, 2))
`
}
              </Feature.Code>
            </Feature>


            <div className="b-example-divider"></div>

            <Feature title="Calling a task" actions={true}>
              <Feature.Blurb>
                To call the task from the client first create a function signature with the name Python module and function name as on the worker.  The function implementation is not needed.
                <br></br><br></br>
                Use <b><i>function</i>.send()</b> to build a pipeline comprised of this task and submit it to Flink using the client.
              </Feature.Blurb>
              <Feature.Code>
{
`
@tasks.bind()
def multiply(a, b):
pass

pipeline = multiply.send(3, 2)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
              </Feature.Code>
            </Feature>

            <div className="b-example-divider"></div>

        </main>
        <footer className="footer mt-auto py-3 bg-light">
              <div className="container">
              </div>
        </footer>
      </div>
  );
};