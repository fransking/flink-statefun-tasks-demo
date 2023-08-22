import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Large(ish) workflows">
        <Feature.Blurb>
          Workflows can contain thousands of tasks in a parallelism but the Flink Task Managers must be appropriately sized.  
          <br></br><br></br>
          <a href="https://nightlies.apache.org/flink/flink-statefun-docs-release-3.2/docs/modules/http-endpoint/#asynchronous-http-transport-beta" target="_blank">Flink Statefun</a> supports Netty for 
          non-blocking IO but if many tens of thousands of remote functions need to be invoked by a single Task Manager concurrently this may not be enough.
          <br></br><br></br>
          Consider extending Flink Statefun with your own transports (e.g. to an HPC cluster). 
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

pipeline = generate_random_numbers.send(10000).continue_with(average)

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