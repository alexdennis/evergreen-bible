import {
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
  aws_ec2 as ec2,
  aws_iam as iam
} from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { DatabaseCluster, InstanceType } from '@aws-cdk/aws-neptune-alpha';
import { Construct } from "constructs";
import * as path from "path";

export class InfraStack extends Stack {
  public readonly api: RestApi;
  public readonly backendLambda: lambda.Function;
  public readonly neptuneCluster: DatabaseCluster;
  public readonly neptuneClusterRole: iam.Role;
  public readonly vpc: ec2.Vpc;
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.backendLambda = new lambda.Function(this, "graphql-backend", {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 3008,
      handler: "build/index.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "..", "..", "api-backend")
      ),
    });

    this.api = new apigateway.LambdaRestApi(this, "evergreen-bible-api", {
      handler: this.backendLambda,
      proxy: true,
    });


    this.vpc = new ec2.Vpc(this, 'vpc', { maxAzs: 2 });

    this.neptuneCluster = new DatabaseCluster(this, "neptune-cluster", {
      vpc: this.vpc,
      instanceType: InstanceType.T3_MEDIUM,
      iamAuthentication: true
    });

    // Grant the lambda execution connection access to the DB.
    if (this.backendLambda.role) {
      this.neptuneCluster.grantConnect(this.backendLambda.role);
    } 
  }
}
