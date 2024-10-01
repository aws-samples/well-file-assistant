"use client"
import React, { useEffect, useState } from 'react';
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useAuthenticator, Button, Divider, Flex } from '@aws-amplify/ui-react';
import { fetchUserAttributes, FetchUserAttributesOutput } from 'aws-amplify/auth';

const getUserAttributes = async () => {
  try {
    const userAttributes = (await fetchUserAttributes());
    return userAttributes;
  } catch {
    return null;
  }
};

export const NavBar = () => {
  const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>();
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  // Set the user attributtes if the user is signed in
  useEffect(() => {
    if (user) {
      getUserAttributes().then(
        (attriutes) => {
          setUserAttributes(attriutes)
        }
      );
    }
  }, [user])

  return (
    <TopNavigation
      identity={{
        href: "#",
        title: "Well File Assistant",
        // logo: {
        //   src: "/logo-small-top-navigation.svg",
        //   alt: "Service"
        // }
      }}
      utilities={[
        {
          type: "button",
          text: "Home",
          href: "/"
        },
        {
          type: "button",
          text: "View Files",
          href: "/files"
        },
        {
          type: "button",
          text: "Upload Files",
          href: "/upload"
        },
        {
          type: "button",
          text: "Chat",
          href: "/chat"
        },
        // If there is a user, render the signout button, otherwise offer a link which redirects to /login
        authStatus === 'authenticated' && userAttributes?.email ?
          (
            {
              type: "menu-dropdown",
              text: userAttributes?.email,
              iconName: "user-profile",
              items: [
                { id: "signout", text: "Sign out"}
              ],
              onItemClick: (e) => {
                if (e.detail.id === 'signout') {
                  signOut();
                }
              }
            }
          ) :
          {
            type: "button",
            text: "Log in / Sign up",
            href: "/login",
          },
      ]}
    />
  );
}