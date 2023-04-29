import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Task groups">
        <Feature.Blurb>
          Tasks can be parallelised as a group using <b>in_parallel()</b>.
          <br></br><br></br>
          The output of a group is a list of results.
        </Feature.Blurb>
        <Feature.Code>
{
`
from statefun_tasks import in_parallel

pipeline = in_parallel([
    multiply.send(3, 2), 
    multiply.send(4, 2),
    multiply.send(5, 2)
])

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={id} api="/api/task_groups/" template={[{a: [[1], [2], [3]]}]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};