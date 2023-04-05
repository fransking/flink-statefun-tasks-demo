import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Task failures">
        <Feature.Blurb>
          Tasks may raise exceptions which will terminate the remainder of the workflow.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = multiply.send(3, 2) \\
  .continue_with(fail, error_message="An error occurred") \\
  .continue_with(multiply, 10)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_failure/" template={[1, 2, 3]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};