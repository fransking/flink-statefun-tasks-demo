import React, { useState } from 'react';
import Feature from '../../components/Feature'
import { v4 as uuidv4 } from 'uuid'

export default function ExampleFeature() {
  const [id, _] = useState(uuidv4());

  return (
    <div>
      <Feature title="Larg(er) workflows">
        <Feature.Blurb>
        The pipeline function has been tested with parallelsims up to 250k tasks in size calling
        a <a href="https://github.com/fransking/flink-statefun-tasks-embedded/blob/main/statefun-tasks/src/main/java/com/sbbsystems/statefun/tasks/benchmarking/NoopRequestReplyClient.java" target="_blank">noop</a> function.
        <br></br><br></br>
        On a 4 core VM running on an i7-8700K host, the pipeline function is able to aggregate 250k results into a continuation in approximately 15 seconds or 16,666 tasks per second.
        <br></br><br></br>
        <a href="https://github.com/sidekiq/sidekiq" target="_blank">Sidekiq's</a> benchmarks show 15,000 tasks per second for an ActiveJob and 23,500 for Sidekiq::Job.  The tests are not entirely equivalant as it is a different architecture but useful for reference.
        </Feature.Blurb>
        <Feature.Code>
{
`
pipeline = generate_noops.send(250000, num_stages=1).continue_with(count)

result = await flink_client.submit_async(pipeline)
print(result)

----

2023-08-24 13:05:47,439 INFO  com.sbbsystems.statefun.tasks.messagehandlers.ResultsBatchHandler [] - Processing results batch of 249,999 messages for pipeline demo/embedded_pipeline/5b45dcd2-e5e6-4555-aa00-6cb2da2dc0aa completed in 14,709 milliseconds
`
}
        </Feature.Code>

        {/* <Feature.Showcase id={id} api="/api/larger_workflows/" template={[1, 2]} hideNestedPipelines={true} buffered={false} /> */}
      </Feature>

      <div className="b-example-divider"></div>
    </div>
  );
};