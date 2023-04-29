import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function Headline() {
  const [id, _] = useState(uuidv4());
  const code = 
`
@tasks.bind()
async def multiply(a, b):
  await asyncio.sleep(1)
  return a * b

pipeline = multiply.send(3, 2).continue_with(multiply, 10).continue_with(multiply, 2)

result = await flink_client.submit_async(pipeline)
print(result)
`

  return (
    <div>

        <div className="container col-xxl-10 px-4 py-3">
            <hr></hr>
            <div className="row flex-lg-row-reverse align-items-center py-1">
                <div className="d-flex flex-column px-3 col-lg-6"><code><pre>{code}</pre></code></div>

                <div className="col-lg-6">
                    <Feature.Showcase hr={false} id={id} api="/api/task_chaining/" template={[1, 2, 3]} />
                </div>
            </div>
        </div>
      <div className="b-example-divider"></div>
    </div>
  );
};