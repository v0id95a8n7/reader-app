import bcrypt from "bcryptjs";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/options";

const SALT_ROUNDS = 10;

/**
 * Get server session from NextAuth
 */
export const getServerSession = async () => {
  return getNextAuthServerSession(authOptions);
};

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePasswords(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
