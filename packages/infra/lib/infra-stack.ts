import { Stack, StackProps, aws_lambda as lambda, aws_apigateway as apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';


export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const backend = new lambda.Function(this, 'graphql-backend', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'api-backend')),
    });

    const api = new apigateway.LambdaRestApi(this, 'evergreen-bible-api', {
      handler: backend,
      proxy: true
    });
  }
}
