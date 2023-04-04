import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Combining task chains and groups">
        <Feature.Blurb>
          Groups may themselves contain task chains and have continuations.
        </Feature.Blurb>
        <Feature.Code>
{
`
from statefun_tasks import in_parallel

pipeline = in_parallel([
    multiply.send(3, 2), 
    multiply.send(3, 2).continue_with(multiply, 10).continue_with(multiply, 2),
    multiply.send(4, 2).continue_with(multiply, 10),
    multiply.send(5, 2)
]).continue_with(sum_all)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_chains_and_groups/" template={[{a: [[1], [2, 22 , 23], [3, 33], [4]]}, 10]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};