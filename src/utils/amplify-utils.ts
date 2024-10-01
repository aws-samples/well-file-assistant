import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/../amplify/data/resource";

export const amplifyClient = generateClient<Schema>();