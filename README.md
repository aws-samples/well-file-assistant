# Well File Assistant - PDF Information Retrieval with Generative AI

Petroleum engineers face a daunting task when preparing for operations on a well, as they must sift through an extensive collection of documents containing crucial information. This labor-intensive and time-consuming process requires engineers to manually read and analyze hundreds of pages of technical reports, historical data, and regulatory documents for every well they work on. The sheer volume of information can lead to fatigue, overlooked details, and potential human error, which impact project's safety and efficiency. 

Allow engineers to focus on decision-making and problem-solving by leveraging the power of Generative AI for document analysis. This technology revolutionizes the way engineers interact with vast amounts of technical documentation. By employing advanced natural language processing and machine learning algorithms, Generative AI can rapidly scan, comprehend, and synthesize information from thousands of pages in seconds. This not only saves countless hours of manual labor but also significantly reduces the risk of human error and oversight.

This repository contains a tool for retrieving information from multiple PDF files using a chat interface powered by generative AI. It's designed to help engineers quickly find and extract relevant information from large collections of PDF documents.

## Features

- Chat interface for natural language queries
- Generative AI-powered PDF content analysis
- Multi-document search and information retrieval
- Real-time responses based on PDF content
- Authentication, authorization, and user management with Amazon Cognito

## Getting Started
Deploy this app using AWS Amplify. 
1. Fork this repository into your GitHub account. 
1. Navigate to the [AWS Amplify](https://console.aws.amazon.com/amplify) page in the AWS Console.
1. Create a new app using the repository in your GitHub account.
1. Enable access to the following [Amazon Bedrock models](https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess)
    1. Anthropic - Claude 3 Haiku
    1. Anthropic - Claude 3 Sonnet
1. To restrict email address domains which are able to sign up in the app, follow these steps:
    1. Give the Amplify build environment permisson to update the cognito user pool
        1. On the App's Amplify page, navigate to "App settings -> Genral Settings" and look for the Service Role Arn
        1. Navigate to the AWS IAM page in the AWS Console
        1. Search for the AWS Amplify Service Role name (It's part of the ARN)
        1. Add a role policy with the follwing statement. You can find the Arn of your user pool by searching for "UserPool" in the "Deployed backend resources" section of the Amplify branch deployments, and clicking on the link to the user pool.
        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action":  [
                        "cognito-idp:DescribeUserPool",
                        "cognito-idp:UpdateUserPool"
                    ],
                    "Resource": ["arn:aws:cognito-idp:<AWS-Region>:<AWS-Account>:userpool/<user-pool-id>"]
                }
            ]
        }
        ```
    1. Re-deploy the most recent deployment of the AWS Amplify branch.
    1. Update the SSM parameter which specifies allowed email domains:
        1. Navigate to the AWS Console page for the [AWS Systems Manager Parameter Store](https://console.aws.amazon.com/systems-manager/parameters) page.
        1. Search for "well-file-assistant"
        1. Locate the parameter which ends in "allowed-email-domain-list" for the AWS Amplify branch you're working on.
        1. Update the parameter value with a list of allowed email domains. Use a comma to seperate domains: Ex: "amazon.com" or "gmail.com,amazon.com"


## Usage
1. Navigate to the app's domain. You can find the domain by opening the app in the AWS Amplify console.
1. Create a new user by clicking "Log in / Sign up" button on the right side of the top banner. You'll enter an email address and password.
1. Click the "Chat" button in the top banner to reach the chat interface. Try this example prompt:
    1. I'm making a well history for well 30-039-07715. The history will show operational events in the well's past like when it was drilled, completed and worked over. Make a table showing the type of operation, text from the report describing operational details, and document title.
1. To use your own files with this demo, click on the "Upload Files" button, enter the API number of the well your files are associated with, and then drag your files into the web page. Now the chatbot will use these files to answer questions about that well!

## Contributing

We welcome community contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.