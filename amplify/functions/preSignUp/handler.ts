import type { PreSignUpTriggerHandler } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { env } from '$amplify/env/preSignUp'; // replace with your function name

async function getSSMParameter(parameterName: string): Promise<string> {
  // Create an SSM client
  const ssmClient = new SSMClient();

  try {
    // Create the GetParameterCommand
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true, // Set to true if the parameter is encrypted
    });

    // Send the command to get the parameter
    const response = await ssmClient.send(command);

    // Check if the parameter value exists
    if (!response.Parameter || !response.Parameter.Value) {
      throw new Error(`Parameter ${parameterName} not found or has no value`);
    }

    // Return the parameter value
    return response.Parameter.Value;
  } catch (error) {
    console.error(`Error retrieving SSM parameter ${parameterName}:`, error);
    throw error;
  }
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes['email'];

  const allowedEmailDomains = (await getSSMParameter(env.ALLOWED_EMAIL_DOMAINS_SSM_PARAMETER_NAME)).split(",")

  for (const domain of allowedEmailDomains) {
    if (email.endsWith(domain)) {
      return event;
    }
  }
  
  throw new Error(`Invalid email domain. Email address ${event.request.userAttributes['email']} does not end with an allowed domain: ${allowedEmailDomains}`);
};