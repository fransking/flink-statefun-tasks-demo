import React from 'react';
import Feature from '../../components/Feature'

export default function ExampleFeature() {

  return (
    <div>
      <Feature title="Creating a task">
        <Feature.Blurb>
          Tasks are declared on the worker using <b>@tasks.bind</b> and they remain ordinary Python functions that can be called directly.
        </Feature.Blurb>
        <Feature.Code>
{
`
@tasks.bind()
def multiply(a, b):
  return a * b

print(multiply(3, 2))
`
}
        </Feature.Code>
      </Feature>
      <div className="b-example-divider"></div>
    </div>
  );
};