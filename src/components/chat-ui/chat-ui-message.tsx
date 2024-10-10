import {
  Box,
  Button,
  Container,
  Popover,
  Spinner,
  StatusIndicator
} from "@cloudscape-design/components";

import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

import type { Schema } from '@/../amplify/data/resource';
import { formatDate } from "@/utils/date-utils";

import styles from "@/styles/chat-ui.module.scss";
import React, { useState } from "react";

export interface ChatUIMessageProps {
  message: Schema["ChatMessage"]["type"];
  showCopyButton?: boolean;
}

export default function ChatUIMessage(props: ChatUIMessageProps) {
  const [hideRows, setHideRows] = useState<boolean>(true)
  if (!props.message.createdAt) throw new Error("Message createdAt missing");

  return (
    <div>
      {props.message?.role != 'human' && (
        <Container>
          {/* {props.message.content.length === 0 ? (
            <Box>
              <Spinner />
            </Box>
          ) : null} */}
          {props.message.content.length > 0 &&
            props.showCopyButton !== false ? (
            <div className={styles.btn_chabot_message_copy}>
              <Popover
                size="medium"
                position="top"
                triggerType="custom"
                dismissButton={false}
                content={
                  <StatusIndicator type="success">
                    Copied to clipboard
                  </StatusIndicator>
                }
              >
                <Button
                  variant="inline-icon"
                  iconName="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(props.message.content);
                  }}
                />
              </Popover>
            </div>
          ) : null
          }
          {props.message.tool_name ? (
            <div className={styles.btn_chabot_message_copy}>
              <Popover
                size="medium"
                position="top"
                triggerType="custom"
                dismissButton={false}
                content={
                  <StatusIndicator type="success"/>
                }
              >
                <Button
                  onClick={() => {
                    setHideRows(prevState => !prevState);
                  }}
                > 
                {hideRows ? 'Show All Rows' : 'Hide Low Relevance Rows'} 
                </Button>
              </Popover>
            </div>
          ) : null
          }
          <>
            <strong>{formatDate(props.message.createdAt)}</strong>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <table className={styles.markdownTable} {...props} />
                ),
                tr: ({ node, ...props }) => {

                  //Get the value of the relevance score in each table row
                  const children = React.Children.toArray(props.children);
                  
                  const relevanceScoreTd = children[children.length - 2]; // should be second from the last

                  if (!(React.isValidElement(relevanceScoreTd))) throw new Error("Invalid second from last <td> element");

                  const relevanceScoreTdValue = relevanceScoreTd?.props?.children || '10'; // Here you can impliment conditional hiding of rows

                  // console.log("relevanceScore <td> value:", relevanceScoreTdValue); // This will log the value

                  //Hide rows with a low relevanceScore
                  if (hideRows && parseInt(relevanceScoreTdValue) < 4) return <tr className={styles.hiddenRow} {...props} />

                  // Add a 📄 to the second from the last child in props
                  // children.splice(children.length - 2, 0, ' ���');
                  // children[children.length - 2].props?.children = 'hello'

                  else return <tr {...props} />
                },
              }}
            >
              {props.message.content}
            </ReactMarkdown>
            {props.message.tool_calls && typeof props.message.tool_calls === 'string' && JSON.parse(props.message.tool_calls).length > 0 ? (
              <div>
                <strong>Tool Calls:</strong>
                <pre>{JSON.stringify(JSON.parse(props.message.tool_calls), null, 2)}</pre>
              </div>
            ) : null
            }
            {props.message.tool_call_id ? (
              <div>
                <p>Tool Call Id: {props.message.tool_call_id}</p>
              </div>
            ) : null
            }
          </>
        </Container>
      )}
      {props.message?.role === 'human' && (
        <>
          <strong>{formatDate(props.message.createdAt)}</strong>
          <ReactMarkdown>
            {props.message.content}
          </ReactMarkdown>
        </>
      )}
    </div>
  );
}
