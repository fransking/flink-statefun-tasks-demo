import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function Headline() {

    const code = 
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

  return (
    <div>

        <div className="container col-xxl-8 px-4 py-3">
            <hr></hr>
            <div className="row flex-lg-row-reverse align-items-center py-1">
                <div className="d-flex flex-column px-3 col-lg-6"><code><pre>{code}</pre></code></div>

                <div className="col-lg-6">
                    <Feature.Showcase hr={false} id={uuidv4()} api="/api/task_chains_and_groups/" template={[{a: [[1], [2, 22 , 23], [3, 33], [4]]}, 10]} />
                </div>
            </div>
        </div>
      <div className="b-example-divider"></div>
    </div>
  );
};