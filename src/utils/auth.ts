import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key';

const SALT_ROUNDS = 10;

interface JWTPayload {
  id: string;
  name?: string;
  email: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set JWT token in cookie
 */
export function setTokenCookie(token: string): void {
  try {
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
  } catch {
    console.error('Failed to set cookie');
  }
}

/**
 * Get JWT token from cookie
 */
export function getTokenFromCookies(): string | undefined {
  try {
    return cookies().get('auth_token')?.value;
  } catch {
    console.error('Failed to get cookie');
    return undefined;
  }
}

/**
 * Remove JWT token from cookie
 */
export function removeTokenCookie(): void {
  try {
    cookies().delete('auth_token');
  } catch {
    console.error('Failed to delete cookie');
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(req?: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined;
  
  if (req) {
    token = req.cookies.get('auth_token')?.value;
  } else {
    token = getTokenFromCookies();
  }
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
} 