import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Limiting concurrency">
        <Feature.Blurb>
          The <b>max_parallelism</b> parameter can be used to limit the concurrency within a group.
        </Feature.Blurb>
        <Feature.Code>
{
`
from statefun_tasks import in_parallel

pipeline = in_parallel([
    multiply.send(3, 2), 
    multiply.send(4, 2),
    multiply.send(5, 2)
], max_parallelism=2)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={id} api="/api/task_groups_limited_concurrency/" template={[{a: [[1], [2], [3]]}]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};