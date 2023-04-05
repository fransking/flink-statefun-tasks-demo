import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Calling a task">
        <Feature.Blurb>
          To call the task from the client first create a function signature with the same Python module and function name as on the worker.  The function implementation is not needed.
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

        <Feature.Showcase id={uuidv4()} api="/api/calling_a_task/" template={[1]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};