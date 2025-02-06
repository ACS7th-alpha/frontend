import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { accessToken } = await req.json();

    if (!accessToken) {
      console.error('세션 저장 오류: accessToken이 없습니다.');
      return NextResponse.json(
        { message: 'Access token is missing' },
        { status: 400 }
      );
    }

    if (!session) {
      console.error('세션 저장 오류: 유효한 세션이 없습니다.');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ 세션 업데이트 성공:', accessToken);
    return NextResponse.json(
      { message: 'Session updated', accessToken },
      { status: 200 }
    );
  } catch (error) {
    console.error('세션 업데이트 오류:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
