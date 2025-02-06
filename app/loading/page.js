'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('✅ 로그인 확인:', session);

      if (session?.user?.signupRequired) {
        console.warn('⚠️ 회원가입 필요, /signup으로 이동');
        router.replace('/signup'); // ✅ 리프레쉬 없이 이동
      } else {
        console.log('✅ 로그인 성공, 메인 페이지로 이동');
        router.replace('/'); // ✅ 메인 화면으로 이동
      }
    }
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-600">로딩 중...</h1>
    </div>
  );
}
