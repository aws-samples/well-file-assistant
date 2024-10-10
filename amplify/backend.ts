import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data, getChatResponesHandler } from './data/resource';
import { preSignUp } from './functions/preSignUp/resource';
import { storage } from './storage/resource';
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as appSync from 'aws-cdk-lib/aws-appsync';

import path from 'path';
import { fileURLToPath } from 'url';
import { CfnApplication } from 'aws-cdk-lib/aws-sam';


//These are for testing
import { AwsSolutionsChecks } from 'cdk-nag'
import { NagSuppressions } from 'cdk-nag'
import { Aspects } from 'aws-cdk-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the directroy above __dirname
const rootDir = path.resolve(__dirname, '..');

const tags = {
  Project: 'well-file-assistant',
  Environment: 'dev',
}

const backend = defineBackend({
  auth,
  data,
  storage,
  getChatResponesHandler,
  // getInfoFromPdf,
  preSignUp
});

backend.addOutput({
  custom: {
    pre_sign_up_handler_lambda_arn: backend.preSignUp.resources.lambda.functionArn
  }
})

function applyTagsToRootStack(stack: cdk.Stack) {
  const rootStack = cdk.Stack.of(customStack).nestedStackParent
  if (!rootStack) throw new Error('Root stack not found')
  //Apply tags to all the nested stacks
  Object.entries(tags).map(([key, value]) => {
    cdk.Tags.of(rootStack).add(key, value)
  })
  cdk.Tags.of(rootStack).add('rootStackName', rootStack.stackName)
}


//Don't allow unauthenticated identites in the cognito identity pool
const { cfnIdentityPool, cfnUserPool } = backend.auth.resources.cfnResources;
cfnIdentityPool.allowUnauthenticatedIdentities = false;

const dataBucketName = backend.storage.resources.bucket.bucketName

const customStack = backend.createStack('customStack')
applyTagsToRootStack(customStack)

// // This block applies tags to all resources created in this app
const rootStack = cdk.Stack.of(customStack).nestedStackParent
if (!rootStack) throw new Error('Root stack not found')

// Create an SSM parameter
const ssmParameter = new cdk.aws_ssm.StringParameter(customStack, 'AllowedEmailDomainList', {
  parameterName: `/well-file-assistant/${rootStack.stackName}/allowed-email-domain-list`,
  stringValue: 'amazon.com,exampleDomainName.com',
});


// Grant the user pool permission to invoke the Lambda function
backend.preSignUp.resources.lambda.addPermission('UserPoolInvoke', {
  principal: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
  action: 'lambda:InvokeFunction',
  sourceArn: backend.auth.resources.cfnResources.cfnUserPool.attrArn,
});

//Deploy the test data to the s3 bucket
const wellFileDeployment = new s3Deployment.BucketDeployment(customStack, 'test-file-deployment-1', {
  sources: [s3Deployment.Source.asset(path.join(rootDir, 'testData'))],
  destinationBucket: backend.storage.resources.bucket,
  destinationKeyPrefix: 'well-files/'
});

// Lambda function to apply a promp to a pdf file
const queryReportsLambdaRole = new iam.Role(customStack, 'LambdaExecutionRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
  ],
  inlinePolicies: {
    'BedrockInvocationPolicy': new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ["bedrock:InvokeModel"],
          resources: [
            `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
            `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`
          ],
        }),
        new iam.PolicyStatement({
          actions: ["s3:GetObject"],
          resources: [
            `arn:aws:s3:::${dataBucketName}/*`
          ],
        }),
      ]
    })
  }
});

// Import the ImageMagick Lambda Layer from the AWS SAM Application
const imageMagickLayerStack = new CfnApplication(customStack, 'ImageMagickLayer', {
  location: {
    applicationId: 'arn:aws:serverlessrepo:us-east-1:145266761615:applications/image-magick-lambda-layer',
    semanticVersion: '1.0.0',
  },
});
//Get outputs from the imageMagickLayer
const imageMagickLayerArn = imageMagickLayerStack.getAtt('Outputs.LayerVersion').toString()

// Convert the layer arn into an cdk.aws_lambda.ILayerVersion
const imageMagickLayer = lambda.LayerVersion.fromLayerVersionArn(customStack, 'ImageMagickLayerVersion', imageMagickLayerArn)

const ghostScriptLayerStack = new CfnApplication(customStack, 'GhostScriptLambdaLayer', {
  location: {
    applicationId: 'arn:aws:serverlessrepo:us-east-1:154387959412:applications/ghostscript-lambda-layer',
    semanticVersion: '9.27.0',
  },
});
const ghostScriptLayerArn = ghostScriptLayerStack.getAtt('Outputs.LayerVersion').toString()
const ghostScriptLayer = lambda.LayerVersion.fromLayerVersionArn(customStack, 'GhostScriptLayerVersion', ghostScriptLayerArn)

// How AWS Amplify creates lambda functions: https://github.com/aws-amplify/amplify-backend/blob/d8692b0c96584fb699e892183ae68fe302740680/packages/backend-function/src/factory.ts#L368
const queryReportImageLambda = new NodejsFunction(customStack, 'QueryReportImagesTs', {
  runtime: lambda.Runtime.NODEJS_20_X,
  entry: path.join(__dirname, 'functions', 'getInfoFromPdf', 'index.ts'),
  bundling: {
    format: OutputFormat.CJS,
    loader: {
      '.node': 'file',
    },
    // inject: [join(__dirname, 'functions', 'shims.js')],
    bundleAwsSDK: true,
    minify: true,
    sourceMap: true,
  },
  timeout: cdk.Duration.minutes(15),
  memorySize: 3000,
  role: queryReportsLambdaRole,
  environment: {
    'DATA_BUCKET_NAME': dataBucketName,
    // 'MODEL_ID': 'anthropic.claude-3-sonnet-20240229-v1:0',
    'MODEL_ID': 'anthropic.claude-3-haiku-20240307-v1:0',
  },
  layers: [imageMagickLayer, ghostScriptLayer]
});

// Create a Step Functions state machine
const queryImagesStateMachine = new sfn.StateMachine(customStack, 'QueryReportImagesStateMachine', {
  timeout: cdk.Duration.minutes(15),
  stateMachineType: sfn.StateMachineType.EXPRESS,
  logs: {
    destination: new logs.LogGroup(customStack, 'StateMachineLogGroup', {
      logGroupName: `/aws/vendedlogs/states/${rootStack.stackName}/QueryReportImagesStateMachine`,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    }),
    level: sfn.LogLevel.ALL,
    includeExecutionData: true
  },
  tracingEnabled: true,
  definitionBody: sfn.DefinitionBody.fromChainable(
    new sfnTasks.CallAwsService(customStack, 'List S3 Objects', {
      service: 's3',
      action: 'listObjectsV2',
      parameters: {
        Bucket: dataBucketName,
        Prefix: sfn.JsonPath.stringAt('$.s3Prefix'),

      },
      iamAction: 's3:ListBucket',
      iamResources: [
        `arn:aws:s3:::${dataBucketName}`,
        `arn:aws:s3:::${dataBucketName}/*`
      ],
      resultPath: '$.s3Result',

    })
      .next(
        new sfn.Map(customStack, 'Map lambda to s3 keys', {
          inputPath: '$.s3Result.Contents',
          itemsPath: '$',
          maxConcurrency: 200,
          itemSelector: {
            "arguments": {
              "tableColumns.$": "$$.Execution.Input.tableColumns",
              "dataToExclude.$": "$$.Execution.Input.dataToExclude",
              "dataToInclude.$": "$$.Execution.Input.dataToInclude",
              "s3Key.$": "$$.Map.Item.Value.Key",
            }
          },
        })
          .itemProcessor(new sfnTasks.LambdaInvoke(
            customStack, 'ProcessS3Object', {
            lambdaFunction: queryReportImageLambda,
            payloadResponseOnly: true,
          }).addRetry({
            maxAttempts: 10,
            interval: cdk.Duration.seconds(1),
            maxDelay: cdk.Duration.seconds(5),
            errors: [
              'ThrottlingException',
              // 'ValidationException' //This one is rare, but can be triggered by a claude model returning: Output blocked by content filtering policy
            ],
            jitterStrategy: sfn.JitterType.FULL,
          })
          )
      )
      .next(new sfn.Succeed(customStack, 'Succeed'))
  ),
});

backend.getChatResponesHandler.addEnvironment('STEP_FUNCTION_ARN', queryImagesStateMachine.stateMachineArn)
backend.preSignUp.addEnvironment('ALLOWED_EMAIL_DOMAINS_SSM_PARAMETER_NAME', ssmParameter.parameterName)

backend.getChatResponesHandler.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
      `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
      `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0`
    ],
  })
)

backend.getChatResponesHandler.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["states:StartSyncExecution"],
    resources: [queryImagesStateMachine.stateMachineArn],
  })
)

// backend.getInfoFromPdf.resources.lambda.addToRolePolicy(
//   new iam.PolicyStatement({
//     actions: ["bedrock:InvokeModel"],
//     resources: [
//       `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
//       `arn:aws:bedrock:${rootStack.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`
//     ],
//   })
// )

// backend.getInfoFromPdf.resources.lambda.addToRolePolicy(
//   new iam.PolicyStatement({
//     actions: ["s3:GetObject"],
//     resources: [
//       `arn:aws:s3:::${dataBucketName}/*`
//     ],
//   })
// )

backend.preSignUp.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["ssm:GetParameter"],
    resources: [ssmParameter.parameterArn],
  })
)

//Add request level logging to the graphql api
const cloudWatchLogRole = new iam.Role(customStack, 'CloudWatchLogRole', {
  assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
  description: 'Role for AWS AppSync to publish logs to CloudWatch',
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppSyncPushToCloudWatchLogs'), //This includes "CreateLogGroup"
  ]
});
const logConfigProperty: appSync.CfnGraphQLApi.LogConfigProperty = {
  cloudWatchLogsRoleArn: cloudWatchLogRole.roleArn,
  excludeVerboseContent: true,
  fieldLogLevel: 'ALL',
};
backend.data.resources.cfnResources.cfnGraphqlApi.logConfig = logConfigProperty


NagSuppressions.addStackSuppressions(customStack, [
  {
    id: 'AwsSolutions-IAM4',
    reason: 'The lambda execution role must be able to dynamically create log groups, and so will have a * in the iam policy resource section'
  },
])

NagSuppressions.addStackSuppressions(customStack, [
  {
    id: 'AwsSolutions-IAM5',
    reason: 'The Lambda function must be able to get any object from the well file drive bucket, so a * in needed in the resource arn.'
  },
])

NagSuppressions.addStackSuppressions(customStack, [
  {
    id: 'AwsSolutions-L1',
    reason: `This lambda is created by s3Deployment from 'aws-cdk-lib/aws-s3-deployment'`
  },
])

// Use cdk-nag on the custom stack
Aspects.of(customStack).add(new AwsSolutionsChecks({ verbose: true }))

