import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Pausing and resuming workflows">
        <Feature.Blurb>
          A workflow may be paused at any point by issuing a <a href="https://fransking.github.io/flink-statefun-tasks/actions.html#flow-control" target='_blank'>pause</a> to it.  
          Workflows can be automatically paused at pre-defined points by adding <b>wait()</b> to a task or group. 
          Issuing an <a href="https://fransking.github.io/flink-statefun-tasks/actions.html#flow-control" target='_blank'>unpause</a> resumes the workflow.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = multiply.send(3, 2).wait().continue_with(multiply, 5).continue_with(multiply, 10)

future = flink_client.submit(pipeline)
await asyncio.sleep(3)
await flink_client.resume_pipeline_async(pipeline)

print(future.result())
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_pause_and_resume/" template={[1, 2, 3]} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};