/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getChatMessage = /* GraphQL */ `query GetChatMessage($id: ID!) {
  getChatMessage(id: $id) {
    chatSessionId
    content
    createdAt
    id
    owner
    role
    session {
      createdAt
      firstMessage
      id
      owner
      updatedAt
      __typename
    }
    tool_call_id
    tool_calls
    tool_name
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetChatMessageQueryVariables,
  APITypes.GetChatMessageQuery
>;
export const getChatResponse = /* GraphQL */ `query GetChatResponse(
  $chatSessionId: String
  $input: String!
  $messages: [String]
) {
  getChatResponse(
    chatSessionId: $chatSessionId
    input: $input
    messages: $messages
  )
}
` as GeneratedQuery<
  APITypes.GetChatResponseQueryVariables,
  APITypes.GetChatResponseQuery
>;
export const getChatSession = /* GraphQL */ `query GetChatSession($id: ID!) {
  getChatSession(id: $id) {
    createdAt
    firstMessage
    id
    messages {
      nextToken
      __typename
    }
    owner
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetChatSessionQueryVariables,
  APITypes.GetChatSessionQuery
>;
export const listChatMessages = /* GraphQL */ `query ListChatMessages(
  $filter: ModelChatMessageFilterInput
  $limit: Int
  $nextToken: String
) {
  listChatMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      chatSessionId
      content
      createdAt
      id
      owner
      role
      tool_call_id
      tool_calls
      tool_name
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListChatMessagesQueryVariables,
  APITypes.ListChatMessagesQuery
>;
export const listChatSessions = /* GraphQL */ `query ListChatSessions(
  $filter: ModelChatSessionFilterInput
  $limit: Int
  $nextToken: String
) {
  listChatSessions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      firstMessage
      id
      owner
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListChatSessionsQueryVariables,
  APITypes.ListChatSessionsQuery
>;
