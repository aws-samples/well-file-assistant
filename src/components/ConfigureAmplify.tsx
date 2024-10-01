'use client';
import { Amplify } from 'aws-amplify';
import outputs from '@/../amplify_outputs.json';
Amplify.configure(outputs, { ssr: true });
/**
 * @see https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/nextjs-app-router-server-components/#configure-amplify-client-side 
 * @description This instructs the Amplify library to store tokens
 * in the cookie store of a browser. Cookies will be sent along with
 * requests to your Next.js server for authentication.
 */
const Page = () => null

export default Page;