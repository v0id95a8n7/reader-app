import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, type NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/options";

const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key";

const SALT_ROUNDS = 10;

interface JWTPayload {
  id: string;
  name?: string;
  email: string;
  [key: string]: unknown;
}

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
  console.log("Comparing password:", password ? "provided" : "missing", "hash:", hash ? "provided" : "missing");
  try {
    const result = await bcrypt.compare(password, hash);
    console.log("Password comparison result:", result);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

/**
 * Create a JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set JWT token in cookie - used on server
 * This function is kept for backward compatibility, but it's better to use setAuthCookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
}

/**
 * Set JWT token in cookie for NextResponse
 */
export function setAuthCookie(
  response: NextResponse,
  token: string,
): NextResponse {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
  return response;
}

/**
 * Get JWT token from cookie
 */
export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("auth_token");
  return cookieValue?.value;
}

/**
 * Remove JWT token from cookie
 */
export async function removeTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

/**
 * Get current user from request
 */
export async function getCurrentUser(
  req?: NextRequest,
): Promise<JWTPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get("auth_token")?.value;
  } else {
    token = await getTokenFromCookies();
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
