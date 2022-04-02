import {
    Duration,
    Stack,
    StackProps
} from "aws-cdk-lib";
import { DashboardRenderingPreference, DefaultDashboardFactory, MonitoringFacade } from "cdk-monitoring-constructs";
import { Construct } from "constructs";
import { InfraStack } from "./infra-stack";

export interface MonitoringStackProps extends StackProps {
    infraStack: InfraStack
}

export class MonitoringStack extends Stack {
    constructor(scope: Construct, id: string, props: MonitoringStackProps) {
        super(scope, id, props);

        const dashboardFactory = new DefaultDashboardFactory(
            this,
            "DefaultDashboardFactory",
            {
                dashboardNamePrefix: "evergreen",
                createDashboard: true,
                createAlarmDashboard: true,
                createSummaryDashboard: true,
                renderingPreference: DashboardRenderingPreference.INTERACTIVE_AND_BITMAP
            }
        );

        const monitoring = new MonitoringFacade(this, "MonitoringFacade", {
            alarmFactoryDefaults: {
                alarmNamePrefix: "evergreen",
                actionsEnabled: false,
                datapointsToAlarm: 3,
            },
            metricFactoryDefaults: {
                namespace: "evergreen"
            },
            dashboardFactory,
        });

        monitoring.addLargeHeader('API Gateway')
            .monitorApiGateway({
                api: props.infraStack.api,
                apiResource: '/graphql',
                apiMethod: 'POST',
                add5XXFaultRateAlarm: {
                    Warning: {
                        maxErrorRate: 20
                    },
                    Critical: {
                        maxErrorRate: 50
                    }
                }
            })

        monitoring.addLargeHeader("Lambdas")
            .monitorLambdaFunction({
                lambdaFunction: props.infraStack.backendLambda,
                addLatencyP99Alarm: {
                    Warning: { maxLatency: Duration.millis(2400) },
                    Critical: { maxLatency: Duration.millis(4000) }
                }
            })

    }
}
