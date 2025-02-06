// app/components/header.js
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header({ onBudgetClick }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogin = async () => {
    console.log('⚠️ 로그인 버튼 클릭됨');

    // ✅ 로그인 전에 세션 초기화
    await fetch('/api/auth/logout', { method: 'POST' });
    await signOut({ redirect: false });

    // ✅ Google OAuth 창 띄우기
    signIn('google');
  };

  return (
    <header className="bg-white shadow-md p-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center px-6">
        <Link href="/">
          <Image 
            src="/hama_logo.jpg" 
            alt="HAMA Logo" 
            width={150} // 원하는 크기로 조절
            height={50} 
          />
        </Link>
        <input
          type="text"
          placeholder="어떤 상품을 찾으시나요?"
          className="w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* ✅ 로그인 상태에 따라 버튼 변경 */}
        {status === 'authenticated' ? (
          <button
            onClick={async () => {
              // ✅ 로그아웃 전 쿠키 삭제 (자동 로그인 방지)
              document.cookie =
                'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
              document.cookie =
                'next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
              await fetch('/api/auth/logout', { method: 'POST' }); // ✅ 서버 쿠키 삭제
              await signOut({ callbackUrl: '/' }); // ✅ 세션 초기화 후 홈으로 이동
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        ) : (
          <button
            onClick={handleLogin} // ✅ 로그인 버튼 실행
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            로그인
          </button>
        )}
      </div>
      <nav className="w-full flex justify-center space-x-6 text-lg font-medium mt-4 border-b pb-2">
        <button onClick={onBudgetClick} className="hover:underline">
          예산관리
        </button>
        <Link href="#">지출통계</Link>
        <Link href="#">지출달력</Link>
        <Link href="/community">커뮤니티</Link>
      </nav>
    </header>
  );
}
