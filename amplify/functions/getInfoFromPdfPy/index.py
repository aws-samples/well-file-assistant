# https://python.langchain.com/docs/how_to/structured_output/
import json
import os
import base64
# from typing import List, Dict, Any
# from dataclasses import dataclass
from datetime import datetime
import base64

import boto3
from langchain_aws import ChatBedrockConverse
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, BaseMessage

from jsonschema import validate, ValidationError
import fitz  # PyMuPDF

s3_client = boto3.client('s3')

def download_s3_object(s3_key) -> str:
    print(f'At {datetime.now()} acting on path {s3_key}')

    local_path = os.path.join('/tmp', s3_key.split('/')[-1])

    # Download the PDF file from S3
    s3_client.download_file(os.environ['DATA_BUCKET_NAME'], s3_key, local_path)
    
    return local_path


def create_json_schema(column_list):
    #https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-00
    
    field_definitions = {}
    for column in column_list:
        corrected_column_name = column['columnName'].replace(" ", "").lower()
        
        if column['columnName'] == 'date':
            field_definitions[corrected_column_name] = {
                "type": "string",
                "format": "date",
                "pattern": r"^(?:\d{4})-(?:(0[1-9]|1[0-2]))-(?:(0[1-9]|[12]\d|3[01]))$", # This is a regex selector for a date in YYYY-MM-DD format
                "description": column['columnDescription']#"The date of the operation in YYYY-MM-DD format"
            }
        elif column['columnName'] == 'relevanceScore':
            field_definitions[corrected_column_name] = {
                "type": 'integer',
                "minimum": 0,
                "maximum": 10,
                "description": column['columnDescription']
            }
        else:
            field_definitions[corrected_column_name] = {
                "type": "string",
                "description": column['columnDescription']
            }
    
    return {
        "title": "getKeyInformationFromImages",
        "description": "Fill out these arguments based on the image data",
        "type": "object",
        "properties": field_definitions,
        "required": list(field_definitions.keys()),
    }


def convert_pdf_to_content_blocks(pdf_path):
    doc = fitz.open(pdf_path)
    content = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap()
        byte_data = pix.tobytes(output='png')
        image_b64 = base64.b64encode(byte_data).decode('utf-8')
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,${image_b64}",
            },
        }) 
    return content

def lambda_handler(event, context) -> str:
    print('event: ', json.dumps(event, indent=2).replace('\n','\r'))
    
    if event['s3Key'].split('.')[-1] != 'pdf': #Only process pdf files
        return

    column_info_array = event['tableColumns']

    column_info_array_lowercase_name_map = {column.get('columnName').replace(" ","").lower(): column.get('columnName') for column in column_info_array}
    
    column_output_format = create_json_schema(column_info_array)

    print('column_output_format: ')
    print(json.dumps(column_output_format, indent=2))
    
    
    model = ChatBedrockConverse(
        model=os.environ["MODEL_ID"],
        temperature=0
    ).with_structured_output(
        schema=column_output_format,
        include_raw=True,
    )
    
    file_path = download_s3_object(event['s3Key'])
    file_image_content_blocks = convert_pdf_to_content_blocks(file_path)
    
    content = []
    
    for i in range(0, len(file_image_content_blocks), 20):
        content_messages_batch = file_image_content_blocks[i:i+20]
    
        messages = [
            HumanMessage(content=[
                *content_messages_batch,
                {
                    "type": "text",
                    "text": f"""
                    The user is asking you to extract information from an image of a PDF document. 
                    The image contains scanned reports related to a well.
                    Please extract the information from the table and return it as a JSON object with the keys matching the column names.
                    The JSON object should have the following schema: 
                    {column_output_format.get('properties')}
                    """
                    # 
                }
            ])
        ]
        
        response = model.invoke(messages)
        print('model response: \r', json.dumps(response, default=str, indent=2).replace('\n', '\r'))
        
        parsed_response_dict = response.get('parsed')#.__dict__
        print('response parsed: ', parsed_response_dict)
        
        # LLMs sometimes don't respond with the correct schema, so we need to validate the response against the schema
        for _ in range(3): #Give the LLM three tries to correct itself
            try:
                validate(instance=parsed_response_dict, schema=column_output_format)
                print("Data validation successful")
                break
            except ValidationError as ve:
                print("Data validation error:", ve)
                messages.extend([
                    AIMessage(content=json.dumps(parsed_response_dict)),
                    HumanMessage(content = f"Data validation error: {ve}")
                ])
                
                response = model.invoke(messages)
                print('model response: \r', json.dumps(response, default=str, indent=2).replace('\n', '\r'))
                
                parsed_response_dict = response.get('parsed')#.__dict__
                print('response parsed: ', parsed_response_dict)
        
        parsed_response_dict_name_corrected = {
            column_info_array_lowercase_name_map[key]: value 
            for key, value in parsed_response_dict.items()
        }

        print('parsed_response_dict_name_corrected: ', parsed_response_dict_name_corrected)

        content.append(parsed_response_dict_name_corrected)

    return {
            "document_source_s3_key": event['s3Key'],
            "content": content
        }