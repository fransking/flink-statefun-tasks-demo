import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Distributing large(ish) worklows">
        <Feature.Blurb>
          The <i>in_parallel()</i> function accepts a <i>num_stages</i> keyword argument that is used to split large(ish) parallelisms into multiple workflows.  
          <br></br><br></br>
          Instead of N tasks being processed by one pipeline function on one Flink Task Manager, a workflow is created for each stage processing N / num_stages tasks.  
          Each stage can be processed by a different Flink Task Manager.
          <br></br><br></br>
          Statefun Tasks flattens the results of each stage so that the shape stays the same irrespective of num_stages.
        </Feature.Blurb>
        <Feature.Code>
{
`
@tasks.bind()
async def generate_random_numbers(size, num_stages):
    pipeline = in_parallel([
      generate_random_number.send() for _ in range(size)
    ], num_stages=num_stages)
    return pipeline

pipeline = generate_random_numbers.send(20000, num_stages=2).continue_with(average)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={id} api="/api/large_workflows_num_stage/" template={[1, 2]} showIndividualNestedTasks={false} buffered={true} />
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};