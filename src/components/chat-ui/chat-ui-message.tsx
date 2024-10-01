import {
  Box,
  Button,
  Container,
  Popover,
  Spinner,
  StatusIndicator,
  TextContent,
} from "@cloudscape-design/components";
// import { format, parseISO } from 'date-fns';
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
// import { ChatMessage, ChatMessageType } from "./types";
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
  return (
    <div>
      {props.message?.role != 'human' && (
        <Container>
          {props.message.content.length === 0 ? (
            <Box>
              <Spinner />
            </Box>
          ) : null}
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
          {/* {props.message.tool_name ? (
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
          } */}
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

                  const relevanceScoreTdValue = '10';//relevanceScoreTd?.props?.children || '10'; // Here you can impliment conditional hiding of rows

                  // console.log("relevanceScore <td> value:", relevanceScoreTdValue); // This will log the value

                  //Hide rows with a low relevanceScore
                  if ( hideRows && parseInt(relevanceScoreTdValue) < 6) return <tr className={styles.hiddenRow} {...props} />
                  else return <tr {...props} />
                },
              }}
            >
              {props.message.content}
            </ReactMarkdown>

            {/* <ReactMarkdown
              children={props.message.content}
              remarkPlugins={[remarkGfm]}
              components={{
                pre(props) {
                  const { children, ...rest } = props;
                  return (
                    <pre {...rest} className={styles.codeMarkdown}>
                      {children}
                    </pre>
                  );
                },
                table(props) {
                  const { children, ...rest } = props;
                  return (
                    <table {...rest} className={styles.markdownTable}>
                      {children}
                    </table>
                  );
                },
                th(props) {
                  const { children, ...rest } = props;
                  return (
                    <th {...rest} className={styles.markdownTableCell}>
                      {children}
                    </th>
                  );
                },
                td(props) {
                  const { children, ...rest } = props;
                  return (
                    <td {...rest} className={styles.markdownTableCell}>
                      {children}
                    </td>
                  );
                },
              }}
            /> */}
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
        // <TextContent>
        //   <strong>{props.message.content}</strong>
        // </TextContent>
      )}
    </div>
  );
}
