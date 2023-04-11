import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Nested workflows">
        <Feature.Blurb>
          Tasks that return workflows become orchestrators in their own right. 
          The result of an orchestration task is the result of the associated workflow.
          See the <a href="https://fransking.github.io/flink-statefun-tasks/pipelines.html#orchestrator-tasks" target="_blank">documentation</a> for further examples.
        </Feature.Blurb>
        <Feature.Code>
{
`
@tasks.bind()
async def multiply_and_append(a, b):
    await asyncio.sleep(0.5)
    return a + [a[-1] * b]

@tasks.bind()
async def generate_series(start, scale, length):
    await asyncio.sleep(1) 
    pipeline = multiply_and_append.send([start], scale)

    for _ in range(length - 1):
        pipeline.continue_with(multiply_and_append, scale)

    return pipeline

pipeline = multiply.send(1, 2).continue_with(generate_series, 2, 4).continue_with(sum_all)

print(future.result())
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/nested_workflows/" template={[1, 2, 3]} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};