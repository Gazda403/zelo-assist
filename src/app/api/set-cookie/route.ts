import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (token) {
    const cookieStore = await cookies();
    cookieStore.set('authjs.session-token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.json({ error: 'No token' });
}
