import { SpaceBetween } from "@cloudscape-design/components";
// import { ChatMessage } from "./types";
import ChatUIMessage from "./chat-ui-message";
import type { Schema } from '@/../amplify/data/resource';

export interface ChatUIMessageListProps {
  messages?: Array<Schema["ChatMessage"]["type"]>;
  showCopyButton?: boolean;
}

export default function ChatUIMessageList(props: ChatUIMessageListProps) {
  const messages = props.messages || [];

  return (
    <SpaceBetween direction="vertical" size="m">
      {messages.map((message, idx) => (
        <ChatUIMessage
          key={idx}
          message={message}
          showCopyButton={props.showCopyButton}
        />
      ))}
    </SpaceBetween>
  );
}
