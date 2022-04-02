import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Infra from '../lib/infra-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/infra-stack.ts
test("Lambda Created", () => {
    const app = new cdk.App();
      // WHEN
    const stack = new Infra.InfraStack(app, 'MyTestStack');
      // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 3008
    });
});
