import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { comparePasswords, createToken, setTokenCookie } from '~/utils/auth';
import { db } from '~/server/db';


interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json() as LoginRequest;
    const { email, password } = body;
    
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    
    const user = await db.user.findUnique({
      where: { email },
    });
    
    
    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    
    const token = await createToken({
      id: user.id,
      email: user.email,
      ...(user.name ? { name: user.name } : {})
    });
    
    
    setTokenCookie(token);
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 