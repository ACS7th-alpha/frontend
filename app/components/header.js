"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-md p-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold text-gray-800">HAMA</h1>
        <input
          type="text"
          placeholder="어떤 상품을 찾으시나요?"
          className="w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            로그인
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        )}
      </div>
      <nav className="w-full flex justify-center space-x-6 text-lg font-medium mt-4 border-b pb-2">
        <Link href="#">예산관리</Link>
        <Link href="#">지출통계</Link>
        <Link href="#">지출달력</Link>
        <Link href="#">카테고리 ▼</Link>
      </nav>
    </header>
  );
}
