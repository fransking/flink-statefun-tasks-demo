import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Large(ish) workflows">
        <Feature.Blurb>
          {/* Tasks that return workflows become orchestrators in their own right. 
          The result of an orchestration task is the result of the associated workflow.
          See the <a href="https://fransking.github.io/flink-statefun-tasks/pipelines.html#orchestrator-tasks" target="_blank">documentation</a> for further examples. */}
        </Feature.Blurb>
        <Feature.Code>
{
`
@tasks.bind()
async def generate_random_numbers(size):
    pipeline = in_parallel([generate_random_number.send() for _ in range(size)])
    return pipeline

@tasks.bind()
async def generate_random_number():
    return random.randint(0, 10)

@tasks.bind()
async def average(numbers):
    return np.mean(numbers).item()

pipeline = generate_random_numbers.send(6000).continue_with(average)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={id} api="/api/large_workflows/" template={[1, 2]} showIndividualNestedTasks={false} buffered={true} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};