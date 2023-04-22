import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Inline tasks" video="/assets/statefun-tasks-inline-tasks-vlc.mp4">
        <Feature.Blurb>
          Task implementations are normally deployed with the workers but in some situations it may be preferred to define a function locally on the client (such as a notebook) and run it as a task.
          The <b>inline_task()</b> decorator is used in place of <b>tasks.bind()</b> for such cases.  
          <br></br><br></br>
          Clearly there are security implications when running code from untrusted sources so this <a href="https://fransking.github.io/flink-statefun-tasks/extensions.html" target="_blank">behaviour</a> is off by default.
          <br></br><br></br>

        </Feature.Blurb>
        <Feature.Code>
{
`
@inline_task(worker_name='restricted_worker')
def add(a, b):
    return a + b

pipeline = add.send(1, 2)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>
        <Feature.Showcase id={uuidv4()} api="/api/inline_tasks/" template={[1]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};