import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { removeAuthCookie } from '~/utils/auth';


export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    
    removeAuthCookie(response);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 