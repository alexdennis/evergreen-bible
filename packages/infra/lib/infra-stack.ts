import {
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_apigateway as apigateway
} from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";

export class InfraStack extends Stack {
  public readonly backendLambda: lambda.Function;
  public readonly api: RestApi

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.backendLambda = new lambda.Function(this, "graphql-backend", {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 3008,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "..", "..", "api-backend")
      ),
    });

    this.api = new apigateway.LambdaRestApi(this, "evergreen-bible-api", {
      handler: this.backendLambda,
      proxy: true,
    });
  }
}
