import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Larg(er) workflows">
        <Feature.Blurb>
        The pipeline function has been tested with parallelsims up to 250,000 tasks in size calling
        a <a href="https://github.com/fransking/flink-statefun-tasks-embedded/blob/main/statefun-tasks/src/main/java/com/sbbsystems/statefun/tasks/benchmarking/NoopRequestReplyClient.java" target="_blank">noop</a> function.
        <br></br><br></br>
        On a 4 core VM running on an i7-8700K host, the pipeline function is able to aggregate 250,000 results into a continuation in approximately 15 seconds or 16,666 tasks per second.
        <br></br><br></br>
        On a 4 core VM running on an i7-12700K host, the pipeline function is able to aggregate 250,000 results into a continuation in approximately 8.5 seconds or 29,411 tasks per second.
        <br></br><br></br>
        If the results do not need to be ordered performance increases to approximately 78,839 tasks per second.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = generate_noops.send(250000, num_stages=1, ordered=False).continue_with(count)

result = await flink_client.submit_async(pipeline)
print(result)

----

2023-08-24 13:05:47,439 INFO  com.sbbsystems.statefun.tasks.messagehandlers.ResultsBatchHandler [] - Processing results batch of 249,999 messages for pipeline demo/embedded_pipeline/5b45dcd2-e5e6-4555-aa00-6cb2da2dc0aa completed in 14,709 milliseconds

----

2023-08-24 16:42:37,691 INFO  com.sbbsystems.statefun.tasks.messagehandlers.ResultsBatchHandler [] - Processing results batch of 249,999 messages for pipeline demo/embedded_pipeline/8b02be1d-0475-46ee-ae4b-9f6af194f023 completed in 8,430 milliseconds

----

2023-09-03 07:55:05,436 INFO  com.sbbsystems.statefun.tasks.messagehandlers.ResultsBatchHandler [] - Processing results batch of 249,999 messages for pipeline demo/embedded_pipeline/537e12dd-3bab-48d0-a178-5ccc6455ac4a completed in 3,171 milliseconds`
}
        </Feature.Code>

        {/* <Feature.Showcase id={id} api="/api/larger_workflows/" template={[1, 2]} hideNestedPipelines={true} buffered={false} /> */}
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};