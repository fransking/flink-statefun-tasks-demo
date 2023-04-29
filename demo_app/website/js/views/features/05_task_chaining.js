import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Task chaining">
        <Feature.Blurb>
          Tasks can be chained together using <b><i>pipeline</i>.continue_with()</b>.
          <br></br><br></br>
          The output of the first task is passed as input to the second task and so on.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = multiply.send(3, 2).continue_with(multiply, 10).continue_with(multiply, 2)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={id} api="/api/task_chaining/" template={[1, 2, 3]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};