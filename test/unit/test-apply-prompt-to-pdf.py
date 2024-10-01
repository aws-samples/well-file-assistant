import sys, os, json
import boto3
sys.path.append(
    os.path.abspath(
        'amplify/functions/getInfoFromPdfPy'
    )
)

stack_name = 'amplify-wellfileassistant-waltmayf-sandbox-56f4725d67-customStackD2225651-VQOV20FY45EO'
cfn_resource_id = 'QueryReportImagesPy'
cfn_resource_type = "AWS::Lambda::Function"

cloudformation_client = boto3.client('cloudformation')
lambda_client = boto3.client('lambda')

# stack_name = list(json.load(open("cdk.out/artifacts.json")).keys())[0]

print(f'{stack_name=}')

stack_resources = cloudformation_client.describe_stack_resources(StackName=stack_name).get('StackResources')
# print(json.dumps(stack_resources, indent = 4, default = str))

lambda_name = [resource['PhysicalResourceId'] for resource in stack_resources if resource['LogicalResourceId'].startswith(cfn_resource_id) and resource['ResourceType']==cfn_resource_type][0]
# print(f'{lambda_name=}')

# Get the environmental variables of the lambda functions
lambda_env_vars = lambda_client.get_function_configuration(FunctionName=lambda_name).get('Environment').get('Variables')
print(f'{lambda_env_vars=}')

#Set the environmental vars
for key, value in lambda_env_vars.items():
    os.environ[key] = value

# #Manually change an env var
# os.environ['MODEL_ID'] = 'anthropic.claude-3-haiku-20240307-v1:0'

import importlib
lambda_dir = importlib.import_module("index")

# event = {
#     "Prompt": "Operational events, dates, summaries, and details",
#     "Key": "new-mexico-well-files/uwi=30-039-07730/30-039-07730_00406.pdf"
# }

event =  {
    "tablePurpose": "Generate a well history showing operational events for the well",
    "tableColumns": [
        {
            "columnName": "date",
            "columnDescription": "\n            The date of the event in YYYY-MM-DD format. Only use format YYYY-MM-DD.\n            This column should only contain dates in the YYYY-MM-DD format.\n            Assume two digit dates less than 30 are in the 2000s and the rest are in the 1900s\n            If there is no date, leave this field blank.\n            "
        },
        {
            "columnName": "Operation",
            "columnDescription": "The type of operation performed on the well"
        },
        {
            "columnName": "Details",
            "columnDescription": "Text describing details of the operation from the report"
        },
        {
            "columnName": "Document",
            "columnDescription": "The title of the document describing the operation details"
        },
        {
            "columnName": "relevanceScore",
            "columnDescription": "On a scale from 1 to 10, how relevant is this document to answering the table's purpose: Generate a well history showing operational events? Assign a score less than 5 if the document meets this criteria: changes in transporter, cathodic protection construction "
        }
    ],
    "s3Key": "well-files/field=SanJuanEast/uwi=30-039-07715/30-039-07715_00117.pdf"
}


response = lambda_dir.lambda_handler(event,{})

# print(f'{response=}')
print('response: ', json.dumps(response, indent = 4, default = str))
# print('content: ',json.dumps([json.loads(c) for c in response.get('content')], indent = 4, default = str))

assert False