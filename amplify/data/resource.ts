import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';

export const getChatResponesHandler = defineFunction({
  name: "getChatResponseHandler",
  entry: '../functions/getChatResponseHandler/index.ts',
  timeoutSeconds: 900,
  environment: {
    // MODEL_ID: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
    MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0'
  }
});

// export const getInfoFromPdf = defineFunction({
//   name: "getInfoFromPdf",
//   entry: '../functions/getInfoFromPdf/index.ts',
//   timeoutSeconds: 900,
//   environment: {
//     // MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
//     MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0'
//   }
// });

const schema = a.schema({
  ChatSession: a
    .model({
      messages: a.hasMany("ChatMessage", "chatSessionId"),
      firstMessage: a.string()
    })
    .authorization((allow) => [allow.owner(), allow.authenticated()]), //The allow.authenticated() allows other users to view chat sessions.

  ChatMessage: a
    .model({
      chatSessionId: a.id(),
      session: a.belongsTo("ChatSession","chatSessionId"),
      content: a.string().required(),
      role: a.enum(["human", "ai", "tool"]),
      owner: a.string(),
      createdAt: a.datetime(),
      tool_call_id: a.string(), //This is the langchain tool call id
      tool_name: a.string(),
      tool_calls: a.json()
      // tool_calls: a.list(a.customType({
      //   id: a.string()
      // }))
    })
    .secondaryIndexes((index) => [
      index("chatSessionId").sortKeys(["createdAt"])
    ])
    .authorization((allow) => [allow.owner(), allow.authenticated()]),

  getChatResponse: a
    .query()
    .arguments({ 
      input: a.string().required(), 
      chatSessionId: a.string(), 
      // messages: a.string().array()
      // messages: a.ref("ChatMessage").array()
      // messages: a.customType({
      //   body: a.string(),
      //   role: a.string()
      // })
  })
    .returns(a.json())
    .handler(a.handler.function(getChatResponesHandler))
    .authorization((allow) => [allow.authenticated()]),
  
  getInfoFromPdf: a
    .query()
    .arguments({ 
      s3Key: a.string().required(), 
      // tablePurpose: a.string().required(),
      tableColumns: a.json().required(),
      dataToExclude: a.json(),
      dataToInclude: a.json()
  })
    .returns(a.json())
    // .handler(a.handler.function(getInfoFromPdf))
    // .authorization((allow) => [allow.authenticated()]),

})
.authorization(allow => [allow.resource(getChatResponesHandler)]);


export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  }  
});
