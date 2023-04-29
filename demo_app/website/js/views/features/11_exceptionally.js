import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Handling task failures">
        <Feature.Blurb>
          Task failures may be caught by adding <b>exceptionally</b> tasks to the workflow.
          The behaviour mimics try-catch symantics so if the exceptionally task itself does not raise an error then the workflow will continue as normal. 
          In this example the division by zero in the second task will cause a ZeroDivisionError to be raised.  
          The workflow will jump to the exceptionally task which will handle this error.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = multiply.send(3, 2) \\
  .continue_with(divide, 0) \\
  .continue_with(multiply, 2) \\
  .exceptionally(handle_error, return_value=6) \\ 
  .continue_with(multiply, 2)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={id} api="/api/task_failure_with_exceptionally/" template={[1, 2, 3, 4, 5]} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};