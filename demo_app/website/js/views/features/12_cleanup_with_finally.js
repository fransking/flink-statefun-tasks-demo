import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Cleaning up with a finally task">
        <Feature.Blurb>
          A workflow may have a <b>finally_do</b> task that mimics try-catch-finally symantics.  
          The result of the workflow is the result of the task that ran prior - in this case the error from task #2.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = multiply.send(3, 2) \\
  .continue_with(fail, error_message="An error occurred") \\
  .continue_with(multiply, 10) \\
  .finally_do(cleanup)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_failure_with_finally/" template={[1, 2, 3, 4]} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};