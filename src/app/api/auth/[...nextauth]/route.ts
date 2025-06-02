/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import NextAuth from "next-auth";
import { authOptions } from "./options";

// Create a handler using NextAuth
const handler = NextAuth(authOptions);

// Export the handler functions
export { handler as GET, handler as POST };