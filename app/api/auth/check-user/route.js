//app/auth/check-user/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // ✅ 로그인된 사용자 정보 가져오기
  const { googleId, email } = session.user;

  try {
    const response = await fetch('http://localhost:3001/auth/google/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleId, email }),
    });

    const data = await response.json();
    console.log('✅ 백엔드 응답:', data);

    if (response.status === 401) {
      return Response.json({ message: 'User not found' }, { status: 401 });
    }

    return Response.json({ message: 'User exists' }, { status: 200 });
  } catch (error) {
    console.error('🚨 API 요청 중 오류 발생:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
