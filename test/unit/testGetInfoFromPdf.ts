import { handler } from "@/../amplify/functions/getInfoFromPdf/index"
import { AppSyncResolverEvent, Context } from 'aws-lambda';
import { Schema } from '@/../amplify/data/resource';
import outputs from '@/../amplify_outputs.json';

process.env.AWS_DEFAULT_REGION = outputs.auth.aws_region
// process.env.MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
process.env.MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0'
process.env.DATA_BUCKET_NAME = outputs.storage.bucket_name

const event: AppSyncResolverEvent<Schema['getInfoFromPdf']['args']> = {
  arguments: {
    tablePurpose: "Generate a well history showing operational events for the well",
    tableColumns: [
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
        "columnName": "containsSpecificOperations",
        "columnDescription": `
            Is the document about any of these: cathodic protection, changes in transporter, certificate 
            `
        //Line numbers where any of these are mentioned: cathodic protection, changes in transporter, certificate 

        // Write a list of line numbers where one of the following is mentioned: cathodic protection, changes in transporter

        // Write a list of sentences from the report which mention one of the following: cathodic protection
        // Only include text directly from the report.

        // Write a list of line numbers where cathodic is mentioned.

        // Start with a score of 5.
        // Subtract 4 if the document contains any data about about: cathodic protection, changes in transporter.
        // Add 3 if the document is meaningful to the table's purpose: "Generate a well history showing changes made to the wellbore"
        //If not, assign a score of 8 for documents relevant to the objective: "Generate a well history showing operational events".
        // Assign a score less than 3 if any image contains anything similar to: cathodic protection, certificates, changes in transporter.
        // If not, assign higher scores for documents more relevant to the objective: "Generate a well history showing operational events?".
      }
    ],
    s3Key: "well-files/field=SanJuanEast/uwi=30-039-07715/30-039-07715_00114.pdf" // Change in Transporter
    // s3Key: "well-files/field=SanJuanEast/uwi=30-039-07715/3003907715_24_wf_1.pdf" // Cathodic Protection
    // s3Key: "well-files/field=SanJuanEast/uwi=30-039-07715/30-039-07715_00112.pdf" //Drill Report
  },
  source: null,
  request: {
    headers: {},
    domainName: null,
  },
  info: {
    fieldName: 'yourFieldName',
    parentTypeName: 'Query',
    selectionSetList: [],
    selectionSetGraphQL: '',
    variables: {}
  },
  prev: null,
  stash: {},
};

const dummyContext: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'test-function',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  awsRequestId: '52fdfc07-2182-154f-163f-5f0f9a621d72',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2020/09/22/[$LATEST]abcdefghijklmnopqrstuvwxyz',
  // identity: null,
  // clientContext: null,
  getRemainingTimeInMillis: () => 3000,
  done: () => { },
  fail: () => { },
  succeed: () => { },
};

const main = async () => {
  const response = await handler(event, dummyContext, () => null)

  console.log('Handler response: ', response)
}

main()