import React from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Task failures">
        <Feature.Blurb>
          Tasks may raise exceptions which will terminate the remainder of the workflow.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = multiply.send(3, 2) \\
  .continue_with(fail, error_message="An error occurred") \\
  .continue_with(multiply, 10)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_failure/" template={[1, 2, 3]} />
      </Feature>

      <div className="b-example-divider"></div>

      <Feature title="Task failures in groups">
        <Feature.Blurb>
          A failing task within a group will terminate the workflow but only once the rest of the group is complete.
        </Feature.Blurb>
        <Feature.Code>
        {
`
pipeline = in_parallel([
    multiply.send(3, 2), 
    fail.send(error_message="An error occurred"),
    fail.send(error_message="Another error occurred"),
    multiply.send(5, 2)
], max_parallelism=2).continue_with(sum_all)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_failure_within_group/" template={[{a: [[1], [2], [3], [4]]}, 5]} />
      </Feature>
      <div className="b-example-divider"></div>

      <Feature title="Returning exceptions from groups">
        <Feature.Blurb>
          Setting <b>return_exceptions</b> to true will propogate errors as results and keep the pipeline running.
        </Feature.Blurb>
        <Feature.Code>
        {
`
pipeline = in_parallel([
    multiply.send(3, 2), 
    fail.send(error_message="An error occurred"),
    fail.send(error_message="Another error occurred"),
    multiply.send(5, 2)
], max_parallelism=2, return_exceptions=True).continue_with(sum_numbers)

result = await flink_client.submit_async(pipeline)
print(result)
`
}
        </Feature.Code>

        <Feature.Showcase id={uuidv4()} api="/api/task_failure_within_group_return_exceptions/" template={[{a: [[1], [2], [3], [4]]}, 5]} />
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};