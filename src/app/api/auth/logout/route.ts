import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Удаление куки аутентификации через установку пустого значения и срока действия в прошлом
    response.cookies.set({
      name: 'auth_token',
      value: '',
      expires: new Date(0), // Срок в прошлом - 1970-01-01
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 