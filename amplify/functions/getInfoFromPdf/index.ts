import { Schema } from '../../data/resource';

import { ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage, AIMessage, ToolMessage, BaseMessage, MessageContentText } from "@langchain/core/messages";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

import { convertPdfToPngs } from './convertPdfToPng'

import { validate } from 'jsonschema';

interface ColumnInfo {
    columnName: string;
    columnDescription: string;
}

interface Column {
    columnName: string;
    columnDescription: string;
}

interface FieldDefinition {
    type: string;
    description: string;
    format?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    default?: any;
    items?: any;
}

interface JsonSchema {
    title: string;
    description: string;
    type: string;
    properties: Record<string, FieldDefinition>;
    required: string[];
}

function removeSpaceAndLowerCase(str: string): string {
    //return a string that matches regex pattern '^[a-zA-Z0-9_-]{1,64}$'
    let transformed = str.replaceAll(" ", "").toLowerCase()
    transformed = transformed.replace(/[^a-zA-Z0-9_-]/g, '');
    transformed = transformed.slice(0, 64);

    return transformed;
}

function createJsonSchema(columnList: Column[]): JsonSchema {
    // https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-00
    const fieldDefinitions: Record<string, FieldDefinition> = {};

    for (const column of columnList) {
        const correctedColumnName = removeSpaceAndLowerCase(column.columnName)

        if (column.columnName === 'date') {
            fieldDefinitions[correctedColumnName] = {
                type: "string",
                format: "date",
                pattern: "^(?:\\d{4})-(?:(0[1-9]|1[0-2]))-(?:(0[1-9]|[12]\\d|3[01]))$", // This is a regex selector for a date in YYYY-MM-DD format
                description: column.columnDescription // "The date of the operation in YYYY-MM-DD format"
            };
        } else if (column.columnName === 'excludeRow') {
            fieldDefinitions[correctedColumnName] = {
                type: 'boolean',
                default: true,
                description: column.columnDescription
            };
            // fieldDefinitions[correctedColumnName] = {
            //     "type": "array",
            //     "items": {
            //         "type": "integer"
            //     },
            //     "default": [],
            //     "description": column.columnDescription,
            // }
        } else {
            fieldDefinitions[correctedColumnName] = {
                type: "string",
                description: column.columnDescription
            };
        }
    }

    return {
        title: "getKeyInformationFromImages",
        description: "Fill out these arguments based on the image data",
        type: "object",
        properties: fieldDefinitions,
        required: Object.keys(fieldDefinitions),
    };
}

async function convertPdfToB64Strings(s3Key: string,): Promise<string[]> {
    // Initialize S3 client
    const s3Client = new S3Client();

    try {
        // Fetch PDF from S3
        const getObjectParams = {
            Bucket: process.env.DATA_BUCKET_NAME,
            Key: s3Key,
        };
        const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
        if (!Body) throw new Error('Failed to fetch PDF from S3');

        // Load PDF document
        const pdfBytes = await Body.transformToByteArray();
        // console.log("pdf Bytes: ", pdfBytes)

        const pngBuffers = await convertPdfToPngs(Buffer.from(pdfBytes))

        const pngB64Strings = pngBuffers.map((pngBuffer) => {
            return pngBuffer.toString('base64');
        })
        // console.log("png Strings: ", pngB64Strings)

        return pngB64Strings

    } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
    }
}


export const handler: Schema["getInfoFromPdf"]["functionHandler"] = async (event, context) => {

    // throw new Error("This function is not implemented yet");
    // console.log('event: ', event)
    // console.log('context: ', context)
    // console.log('Amplify env: ', env)

    // If event.aruments.tableColumns is not an array throw an error
    if (!Array.isArray(event.arguments.tableColumns)) throw new Error("tableColumns must be an array of TableColumn type");
    const columnInfoArray: ColumnInfo[] = event.arguments.tableColumns

    const columnInfoArrayLowercaseNameMap = Object.fromEntries(
        columnInfoArray.map(column => [removeSpaceAndLowerCase(column.columnName), column.columnName])
    );

    // Check if every element of event.arguments.tableColumns has the TableColumn type
    columnInfoArray.forEach((column) => {
        if (typeof column !== 'object' || !('columnName' in column) || !('columnDescription' in column)) {
            throw new Error("tableColumns must be an array of TableColumn type");
        }
    });

    const tableRowOutputFomat = createJsonSchema(columnInfoArray)

    const pdfImageBuffers = await convertPdfToB64Strings(event.arguments.s3Key)
    const imageMessaggeContentBlocks = pdfImageBuffers.map((imageB64String) => {
        return {
            type: "image_url",
            image_url: {
                url: `data:image/png;base64,${imageB64String}`,
            },
        }
    })

    // Print the structure of the outputSchema:
    console.log('Target output schema: ', tableRowOutputFomat)

    const model = new ChatBedrockConverse({
        model: process.env.MODEL_ID,
        temperature: 0
    }).withStructuredOutput(
        tableRowOutputFomat, {
        includeRaw: true,
        name: 'getKeyInformationFromImages'
    }
    )

    const content = [];

    for (let i = 0; i < imageMessaggeContentBlocks.length; i += 20) {
        const contentMessagesBatch = imageMessaggeContentBlocks.slice(i, i + 20);
        const messages = [
            new HumanMessage({
                content: [
                    ...contentMessagesBatch,
                    {
                        type: "text",
                        text: `
                        The user is asking you to extract information from an image of a PDF document. 
                        The image contains scanned reports related to a well.
                        Please extract the information from the table and return it as a JSON object with the keys matching the column names.
                        `
                    },
                ]
            }
            )
        ]

        let response = await model.invoke(messages)
        console.log('model response: ', response)

        for (let attempt = 0; attempt < 3; attempt++) {
            const validationReslut = validate(response.parsed, tableRowOutputFomat);
            console.log("Data validation result: ", validationReslut.valid);
            if (validationReslut.valid) {
                break;
            }
            console.log("Data validation error:", validationReslut.errors.join('\n'));
            messages.push(
                new AIMessage({ content: JSON.stringify(response.parsed) }),
                new HumanMessage({ content: `The data extracted from the image is not valid. Data validation error: ${validationReslut.errors.join('\n')}. Please try again.` })
            );

            response = await model.invoke(messages)
            console.log('model response: \r', response);
        }

        if (!response.parsed) throw new Error("No parsed response from model");


        const parsedResponseDictNameCorrected = Object.fromEntries(
            Object.entries(response.parsed).map(([key, value]) => [columnInfoArrayLowercaseNameMap[key], value])
        );

        // parsedResponseDictNameCorrected['excludedPhrases'] = parsedResponseDictNameCorrected['excludedPhrases'].length

        content.push(parsedResponseDictNameCorrected);
    }

    console.log('content: ', content)
    return {
        document_source_s3_key: event.arguments.s3Key,
        content: content
    };

};