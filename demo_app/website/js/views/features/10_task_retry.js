import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Retrying tasks">
        <Feature.Blurb>
          Tasks may be retried in case of failure by adding a <b>RetryPolicy</b>.  
          The <a href="https://github.com/fransking/flink-statefun-tasks-demo/blob/main/demo_app/py_files/tasks/_tasks.py#L53" target="_blank">example</a> makes use of Flink's stateful features to succeed on the second attempt.
        </Feature.Blurb>
        <Feature.Code>
{
`
@tasks.bind(retry_policy=RetryPolicy(retry_for=[ValueError], max_retries=2))
async def flakey_multiply(a, b):
    pass


pipeline = multiply.send(3, 2) \\
  .continue_with(flakey_multiply, 5) \\
  .continue_with(multiply, 10)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_failure_with_retry/" template={[1, 2, 3]} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};