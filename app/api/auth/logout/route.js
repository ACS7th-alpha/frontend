import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });

  // ✅ 쿠키 삭제 (자동 로그인 방지)
  response.cookies.set('next-auth.session-token', '', { maxAge: 0 });
  response.cookies.set('next-auth.csrf-token', '', { maxAge: 0 });
  response.cookies.set('signupRequired', '', { maxAge: 0 });

  return response;
}
