"use client"
import React, { useEffect, useState } from 'react';
import type { Schema } from '@/../amplify/data/resource';
import { amplifyClient } from '@/utils/amplify-utils';
import { Text, Link } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';

import { formatDate } from "@/utils/date-utils";

// import SideNavigation from "@cloudscape-design/components/side-navigation";

import styles from './page.module.css'
import '@aws-amplify/ui-react/styles.css'

import { ChatUI } from "@/components/chat-ui/chat-ui";
import { withAuth } from '@/components/WithAuth';

const combineAndSortMessages = ((arr1: Array<Schema["ChatMessage"]["type"]>, arr2: Array<Schema["ChatMessage"]["type"]>) => {
    const combinedMessages = [...new Set([...arr1, ...arr2])] //TODO find out why this does not remove duplicate messages
    const uniqueMessages = combinedMessages.filter((message, index, self) =>
        index === self.findIndex((p) => p.id === message.id)
    );
    return uniqueMessages.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) throw new Error("createdAt is missing")
        return a.createdAt.localeCompare(b.createdAt)
    });
})

function Page({ params }: { params?: { chatSessionId: string } }) {
    const [messages, setMessages] = useState<Array<Schema["ChatMessage"]["type"]>>([]);
    const [chatSessions, setChatSessions] = useState<Array<Schema["ChatSession"]["type"]>>([]);
    const [activeChatSession, setActiveChatSession] = useState<Schema["ChatSession"]["type"]>();
    const [isLoading, setIsLoading] = useState(false);
    // const { authStatus } = useAuthenticator(context => [context.authStatus]);
    // const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const router = useRouter();

    useEffect(() => {
        console.log("Messages: ", messages)
        if (messages.length){
            console.log("Last Message: ", messages[messages.length-1])
            // console.log("No tool calls?", messages[messages.length-1].tool_calls === "[]")
        }

        

        // If the last message is from ai and has no tool call, set isLoading to false
        if (
            messages.length && 
            messages[messages.length-1].role === "ai" && 
            messages[messages.length-1].tool_calls === "[]"
        ) setIsLoading(false)

    }, [messages])

    //Set the chat session from params
    useEffect(() => {
        if (params && params.chatSessionId) {
            amplifyClient.models.ChatSession.get({ id: params.chatSessionId }).then(({ data: chatSession }) => {
                if (chatSession) {
                    setActiveChatSession(chatSession);
                }
            })
        }
    }, [params])


    // List the user's chat sessions
    useEffect(() => {
        console.log("user: ", user)
        if (user) {
            amplifyClient.models.ChatSession.observeQuery({
                filter: {
                    // owner: { eq: user.userId }
                    owner: { contains: user.userId }
                }
            }).subscribe({
                next: (data) => setChatSessions(data.items)
            })
        }

    }, [user])

    // Subscribe to messages of the active chat session
    useEffect(() => {

        setMessages([])

        if (activeChatSession) {
            const sub = amplifyClient.models.ChatMessage.observeQuery({
                filter: {
                    chatSessionId: { eq: activeChatSession.id }
                }
            }).subscribe({
                next: ({ items, isSynced }) => {
                    
                    setMessages((prevMessages) => combineAndSortMessages(prevMessages, items))



                    // if (isSynced) {
                    //     //Order the data items
                    //     items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

                    //     console.log("Active Chat Session: ", activeChatSession)
                    //     console.log("Messages: ", items)

                    //     setMessages(items)
                    // }

                }
            }
            )

            return () => sub.unsubscribe();
        }

    }, [activeChatSession])

    

    async function createChatSession(firstMessage?: string) {
        amplifyClient.models.ChatSession.create({ firstMessage: firstMessage }).then(({ data: newChatSession }) => {
            if (newChatSession) {
                setActiveChatSession(newChatSession);
                // Add new chat session to the list of sessions
                // setChatSessions((prevChatSessions) => [...prevChatSessions, newChatSession]);
                if (firstMessage) {
                    addUserChatMessage(firstMessage, newChatSession.id);
                }

                router.push(`/chat?chatSessionId=${newChatSession.id}`)
                // redirect(`/chat?chatSessionId=${newChatSession.id}`)
            }
        })

    }

    async function deleteChatSession(targetSession: Schema['ChatSession']['type']) {
        amplifyClient.models.ChatSession.delete({ id: targetSession.id })
        // Remove the target session from the list of chat sessions
        setChatSessions((previousChatSessions) => previousChatSessions.filter(existingSession => existingSession.id != targetSession.id))
    }

    function addChatMessage(body: string, role: "human" | "ai" | "tool", chatSessionId?: string) {
        const targetChatSessionId = chatSessionId ? chatSessionId : activeChatSession?.id;

        if (targetChatSessionId) {
            return amplifyClient.models.ChatMessage.create({
                content: body,
                role: role,
                chatSessionId: targetChatSessionId
            })
            // .then(
            //     (response) => {
            //         if (response.data) {
            //             const newMessage = response.data;
            //             setMessages((prevMessages) => [...prevMessages, newMessage]);
            //         }
            //     }
            // )
        }
    }

    async function addUserChatMessage(body: string, chatSessionId?: string) {
        await addChatMessage(body, "human", chatSessionId)
        sendMessageToChatBot(body, chatSessionId);
    }

    function sendMessageToChatBot(input: string, chatSessionId?: string) {
        setIsLoading(true);
        const targetChatSessionId = chatSessionId ? chatSessionId : activeChatSession?.id
        if (!targetChatSessionId) throw new Error("No chat session id");

        amplifyClient.queries.getChatResponse({ input: input, chatSessionId: targetChatSessionId }).then(
            (response) => {
                console.log("bot response: ", response)
                // if (response.data) addChatMessage(response.data, "AI", targetChatSessionId)
                // else throw new Error("No response from bot");
            }
        )
    }

    const getChatResponse = async (content: string) => {
        console.log("Handeling message :", content)

        if (!activeChatSession) {
            createChatSession(content)
        } else (
            addUserChatMessage(content)
        )
    };


    return (
        <div>
            {/* <SideNavigation
                //   activeHref={activeHref}
                header={{ href: "#/", text: "Service name" }}
                //   onFollow={event => {
                //     if (!event.detail.external) {
                //       event.preventDefault();
                //       setActiveHref(event.detail.href);
                //     }
                //   }}
                items={[
                    { type: "link", text: "Page 1", href: "#/page1" },
                    { type: "link", text: "Page 2", href: "#/page2" },
                    {
                        type: "section",
                        text: "Section 1",
                        items: [
                            {
                                type: "link",
                                text: "Page 4",
                                href: "#/page4"
                            },
                            {
                                type: "link",
                                text: "Page 5",
                                href: "#/page5"
                            },
                            {
                                type: "link",
                                text: "Page 6",
                                href: "#/page6"
                            }
                        ]
                    },
                    {
                        type: "section",
                        text: "Section 2",
                        items: [
                            {
                                type: "link",
                                text: "Page 7",
                                href: "#/page7"
                            },
                            {
                                type: "link",
                                text: "Page 8",
                                href: "#/page8"
                            },
                            {
                                type: "link",
                                text: "Page 9",
                                href: "#/page9"
                            }
                        ]
                    }
                ]}
            /> */}
            <div className={styles['sidebar']}>
                <div className="horizontal-split">
                    <Link
                        color="#e0e0e0"
                        backgroundColor="#0f1b2a"
                        borderRadius="15px"
                        padding="5px"
                        href='/chat'
                    >
                        Create New Chat Session
                    </Link>
                    <Text><b>My Chat Sessions</b></Text>
                    <ul>
                        {chatSessions
                            .slice()
                            .sort((a, b) => {
                                if (!a.createdAt || !b.createdAt) throw new Error("createdAt is missing")
                                return a.createdAt < b.createdAt ? 1 : -1
                            })
                            .map((session) => (
                                <li key={session.id}>
                                    
                                    <Link
                                        href={`/chat/${session.id}`}
                                        // className={`${styles.chatSessionLink} ${activeChatSession?.id === session.id ? styles.activeChatSession : ''}`}
                                        color="#e0e0e0"
                                        backgroundColor="#0f1b2a"
                                        borderRadius="30px"
                                        padding="5px"
                                    >
                                        {session.firstMessage?.slice(0, 50)}
                                    </Link>
                                    <p>{formatDate(session.createdAt)}</p>
                                    <button
                                        onClick={() => deleteChatSession(session)}
                                    >x</button>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
            <div style={{ marginLeft: '260px', padding: '20px' }}>
                {/* <p>Active Chat Session Id: {activeChatSession?.id} Total messages: {messages.length}</p> */}
                <ChatUI
                    onSendMessage={getChatResponse}
                    messages={messages}
                    running={isLoading}
                />
            </div>
        </div>

    );
};

export default withAuth(Page)