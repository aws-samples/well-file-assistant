/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ChatMessage = {
  __typename: "ChatMessage",
  chatSessionId?: string | null,
  content: string,
  createdAt: string,
  id: string,
  owner?: string | null,
  role?: ChatMessageRole | null,
  session?: ChatSession | null,
  tool_call_id?: string | null,
  tool_calls?: string | null,
  tool_name?: string | null,
  updatedAt: string,
};

export enum ChatMessageRole {
  ai = "ai",
  human = "human",
  tool = "tool",
}


export type ChatSession = {
  __typename: "ChatSession",
  createdAt: string,
  firstMessage?: string | null,
  id: string,
  messages?: ModelChatMessageConnection | null,
  owner?: string | null,
  updatedAt: string,
};

export type ModelChatMessageConnection = {
  __typename: "ModelChatMessageConnection",
  items:  Array<ChatMessage | null >,
  nextToken?: string | null,
};

export type ModelChatMessageFilterInput = {
  and?: Array< ModelChatMessageFilterInput | null > | null,
  chatSessionId?: ModelIDInput | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelChatMessageFilterInput | null,
  or?: Array< ModelChatMessageFilterInput | null > | null,
  owner?: ModelStringInput | null,
  role?: ModelChatMessageRoleInput | null,
  tool_call_id?: ModelStringInput | null,
  tool_calls?: ModelStringInput | null,
  tool_name?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelChatMessageRoleInput = {
  eq?: ChatMessageRole | null,
  ne?: ChatMessageRole | null,
};

export type ModelChatSessionFilterInput = {
  and?: Array< ModelChatSessionFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  firstMessage?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelChatSessionFilterInput | null,
  or?: Array< ModelChatSessionFilterInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelChatSessionConnection = {
  __typename: "ModelChatSessionConnection",
  items:  Array<ChatSession | null >,
  nextToken?: string | null,
};

export type ModelChatMessageConditionInput = {
  and?: Array< ModelChatMessageConditionInput | null > | null,
  chatSessionId?: ModelIDInput | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  not?: ModelChatMessageConditionInput | null,
  or?: Array< ModelChatMessageConditionInput | null > | null,
  owner?: ModelStringInput | null,
  role?: ModelChatMessageRoleInput | null,
  tool_call_id?: ModelStringInput | null,
  tool_calls?: ModelStringInput | null,
  tool_name?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateChatMessageInput = {
  chatSessionId?: string | null,
  content: string,
  id?: string | null,
  owner?: string | null,
  role?: ChatMessageRole | null,
  tool_call_id?: string | null,
  tool_calls?: string | null,
  tool_name?: string | null,
};

export type ModelChatSessionConditionInput = {
  and?: Array< ModelChatSessionConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  firstMessage?: ModelStringInput | null,
  not?: ModelChatSessionConditionInput | null,
  or?: Array< ModelChatSessionConditionInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateChatSessionInput = {
  firstMessage?: string | null,
  id?: string | null,
};

export type DeleteChatMessageInput = {
  id: string,
};

export type DeleteChatSessionInput = {
  id: string,
};

export type UpdateChatMessageInput = {
  chatSessionId?: string | null,
  content?: string | null,
  id: string,
  owner?: string | null,
  role?: ChatMessageRole | null,
  tool_call_id?: string | null,
  tool_calls?: string | null,
  tool_name?: string | null,
};

export type UpdateChatSessionInput = {
  firstMessage?: string | null,
  id: string,
};

export type ModelSubscriptionChatMessageFilterInput = {
  and?: Array< ModelSubscriptionChatMessageFilterInput | null > | null,
  chatSessionId?: ModelSubscriptionIDInput | null,
  content?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionChatMessageFilterInput | null > | null,
  owner?: ModelStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  tool_call_id?: ModelSubscriptionStringInput | null,
  tool_calls?: ModelSubscriptionStringInput | null,
  tool_name?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionChatSessionFilterInput = {
  and?: Array< ModelSubscriptionChatSessionFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  firstMessage?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionChatSessionFilterInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type GetChatMessageQueryVariables = {
  id: string,
};

export type GetChatMessageQuery = {
  getChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type GetChatResponseQueryVariables = {
  chatSessionId?: string | null,
  input: string,
  messages?: Array< string | null > | null,
};

export type GetChatResponseQuery = {
  getChatResponse?: string | null,
};

export type GetChatSessionQueryVariables = {
  id: string,
};

export type GetChatSessionQuery = {
  getChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type ListChatMessagesQueryVariables = {
  filter?: ModelChatMessageFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListChatMessagesQuery = {
  listChatMessages?:  {
    __typename: "ModelChatMessageConnection",
    items:  Array< {
      __typename: "ChatMessage",
      chatSessionId?: string | null,
      content: string,
      createdAt: string,
      id: string,
      owner?: string | null,
      role?: ChatMessageRole | null,
      tool_call_id?: string | null,
      tool_calls?: string | null,
      tool_name?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListChatSessionsQueryVariables = {
  filter?: ModelChatSessionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListChatSessionsQuery = {
  listChatSessions?:  {
    __typename: "ModelChatSessionConnection",
    items:  Array< {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateChatMessageMutationVariables = {
  condition?: ModelChatMessageConditionInput | null,
  input: CreateChatMessageInput,
};

export type CreateChatMessageMutation = {
  createChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateChatSessionMutationVariables = {
  condition?: ModelChatSessionConditionInput | null,
  input: CreateChatSessionInput,
};

export type CreateChatSessionMutation = {
  createChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteChatMessageMutationVariables = {
  condition?: ModelChatMessageConditionInput | null,
  input: DeleteChatMessageInput,
};

export type DeleteChatMessageMutation = {
  deleteChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteChatSessionMutationVariables = {
  condition?: ModelChatSessionConditionInput | null,
  input: DeleteChatSessionInput,
};

export type DeleteChatSessionMutation = {
  deleteChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateChatMessageMutationVariables = {
  condition?: ModelChatMessageConditionInput | null,
  input: UpdateChatMessageInput,
};

export type UpdateChatMessageMutation = {
  updateChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateChatSessionMutationVariables = {
  condition?: ModelChatSessionConditionInput | null,
  input: UpdateChatSessionInput,
};

export type UpdateChatSessionMutation = {
  updateChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateChatMessageSubscriptionVariables = {
  filter?: ModelSubscriptionChatMessageFilterInput | null,
  owner?: string | null,
};

export type OnCreateChatMessageSubscription = {
  onCreateChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateChatSessionSubscriptionVariables = {
  filter?: ModelSubscriptionChatSessionFilterInput | null,
  owner?: string | null,
};

export type OnCreateChatSessionSubscription = {
  onCreateChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteChatMessageSubscriptionVariables = {
  filter?: ModelSubscriptionChatMessageFilterInput | null,
  owner?: string | null,
};

export type OnDeleteChatMessageSubscription = {
  onDeleteChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteChatSessionSubscriptionVariables = {
  filter?: ModelSubscriptionChatSessionFilterInput | null,
  owner?: string | null,
};

export type OnDeleteChatSessionSubscription = {
  onDeleteChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateChatMessageSubscriptionVariables = {
  filter?: ModelSubscriptionChatMessageFilterInput | null,
  owner?: string | null,
};

export type OnUpdateChatMessageSubscription = {
  onUpdateChatMessage?:  {
    __typename: "ChatMessage",
    chatSessionId?: string | null,
    content: string,
    createdAt: string,
    id: string,
    owner?: string | null,
    role?: ChatMessageRole | null,
    session?:  {
      __typename: "ChatSession",
      createdAt: string,
      firstMessage?: string | null,
      id: string,
      owner?: string | null,
      updatedAt: string,
    } | null,
    tool_call_id?: string | null,
    tool_calls?: string | null,
    tool_name?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateChatSessionSubscriptionVariables = {
  filter?: ModelSubscriptionChatSessionFilterInput | null,
  owner?: string | null,
};

export type OnUpdateChatSessionSubscription = {
  onUpdateChatSession?:  {
    __typename: "ChatSession",
    createdAt: string,
    firstMessage?: string | null,
    id: string,
    messages?:  {
      __typename: "ModelChatMessageConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};
