import outputs from '@/../amplify_outputs.json';

import {
    CognitoIdentityProviderClient,
    UpdateUserPoolCommand,
    DescribeUserPoolCommand
} from "@aws-sdk/client-cognito-identity-provider";
// import { LambdaClient, AddPermissionCommand } from "@aws-sdk/client-lambda";

async function setPreSignupTrigger(
    userPoolId: string,
    lambdaArn: string,
    region: string,
    awsAccount: string
) {
    // Create Cognito and Lambda clients
    const cognitoClient = new CognitoIdentityProviderClient();
    //   const lambdaClient = new LambdaClient({ region });

    try {
        // First, describe the existing User Pool
        const describeCommand = new DescribeUserPoolCommand({
            UserPoolId: userPoolId,
        });
        const { UserPool } = await cognitoClient.send(describeCommand);

        if (!UserPool) {
            throw new Error("User Pool not found");
        }

        // Prepare the update command, maintaining existing configuration
        const updateUserPoolCommand = new UpdateUserPoolCommand({
            UserPoolId: userPoolId,
            AutoVerifiedAttributes: UserPool.AutoVerifiedAttributes,
            EmailVerificationMessage: UserPool.EmailVerificationMessage,
            EmailVerificationSubject: UserPool.EmailVerificationSubject,
            SmsVerificationMessage: UserPool.SmsVerificationMessage,
            VerificationMessageTemplate: UserPool.VerificationMessageTemplate,
            SmsAuthenticationMessage: UserPool.SmsAuthenticationMessage,
            MfaConfiguration: UserPool.MfaConfiguration,
            UserPoolTags: UserPool.UserPoolTags,
            AdminCreateUserConfig: UserPool.AdminCreateUserConfig,
            UserPoolAddOns: UserPool.UserPoolAddOns,
            AccountRecoverySetting: UserPool.AccountRecoverySetting,
            // Update the Lambda config with the new pre-signup trigger
            LambdaConfig: {
                ...UserPool.LambdaConfig,
                PreSignUp: lambdaArn,
            },
        });

        await cognitoClient.send(updateUserPoolCommand);
        console.log("Pre-signup trigger set successfully");

        // // Grant Cognito permission to invoke the Lambda function
        // const addPermissionCommand = new AddPermissionCommand({
        //   FunctionName: lambdaArn,
        //   StatementId: `Cognito_${userPoolId}`,
        //   Action: "lambda:InvokeFunction",
        //   Principal: "cognito-idp.amazonaws.com",
        //   SourceArn: `arn:aws:cognito-idp:${region}:${process.env.AWS_ACCOUNT_ID}:userpool/${userPoolId}`,
        // });

        // await lambdaClient.send(addPermissionCommand);
        // console.log("Lambda permission added successfully");
    } catch (error) {
        console.error("Error setting pre-signup trigger:", error);

        // If the error has type AccessDeniedException, print to the console the AWS IAM policy required to perform this action
        if (error instanceof Error && error.name === "AccessDeniedException") {
            console.log(
                "To set the pre-signup trigger, you need the following AWS IAM policy:"
            );
            console.log(
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": [
                                "cognito-idp:DescribeUserPool",
                                "cognito-idp:UpdateUserPool"
                            ],
                            "Resource": [`arn:aws:cognito-idp:${region}:${awsAccount}:userpool/${userPoolId}`]
                        }
                    ]
                }
            );
        }

        throw error;
    }
}

// Usage
const userPoolId = outputs.auth.user_pool_id
const lambdaArn = outputs.custom.pre_sign_up_handler_lambda_arn
const region = outputs.auth.aws_region
const awsAccount = lambdaArn.split(":")[4]

setPreSignupTrigger(userPoolId, lambdaArn, region, awsAccount)
    .then(() => console.log("Process completed successfully"))
    .catch((error) => console.error("Process failed:", error));