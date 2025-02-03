'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['/banner1.png', '/banner2.png', '/banner3.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
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
              onClick={() => signIn('google')}
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

      {/* 로그인 상태가 아닐 때 */}
      {!session ? (
        <>
          {/* Hero Section */}
          <section className="text-center text-white py-20 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-600"
              style={{
                clipPath:
                  'polygon(50% 0%, 100% 0%, 100% 55%, 70% 70%, 60% 70%, 50% 70%, 40% 70%, 30% 70%, 0% 85%, 0% 0%)',
              }}
            ></div>
            <div className="relative z-10">
              <h2 className="text-5xl font-bold">HAMA와 함께</h2>
              <p className="mt-3 text-lg">
                최저가 육아 용품 구매, 소비패턴 분석을 한 곳에서
              </p>
              <p className="mt-2 text-md max-w-2xl mx-auto">
                온라인 쇼핑 예산, 아기 정보(생년월일, 성별)을 입력하면 해당
                조건에 맞는 최저가 육아 용품을 추천합니다. 월별 소비 내역 및
                카테고리별 지출 통계를 통해 육아 비용을 체계적으로 관리합니다.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => signIn('google')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100"
                >
                  로그인
                </button>
                <button className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-400">
                  회원가입
                </button>
              </div>
              <div className="relative mt-12 flex justify-center">
                <div className="w-2/5 h-[35rem] bg-gray-200 rounded-lg shadow-md flex justify-center items-center overflow-hidden">
                  <img
                    src={images[currentImage]}
                    alt="배너 이미지"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="p-12 text-center bg-white">
            <h2 className="text-4xl font-bold mt-6">언제 어디서든</h2>
            <h2 className="text-4xl font-bold">현명한 소비</h2>
            <p className="text-gray-700 text-lg mt-2">
              월별 소비 내역 및 카테고리별 지출 통계를 통해 육아 비용을
              체계적으로 관리합니다.
            </p>
            <div className="flex justify-center space-x-16 mt-10">
              <div className="text-center max-w-xs">
                <span className="text-3xl">💰</span>
                <h3 className="font-bold text-lg mt-2">
                  최저가 추천으로 육아 비용 절감
                </h3>
                <p className="text-gray-600">
                  최적의 가격을 분석하여 가장 합리적인 육아용품을 추천합니다.
                </p>
              </div>
              <div className="text-center max-w-xs">
                <span className="text-3xl">📊</span>
                <h3 className="font-bold text-lg mt-2">
                  월별/카테고리별 소비 패턴 분석
                </h3>
                <p className="text-gray-600">
                  사용자의 소비 습관을 분석하여 맞춤형 소비 관리를 지원합니다.
                </p>
              </div>
              <div className="text-center max-w-xs">
                <span className="text-3xl">🛍️</span>
                <h3 className="font-bold text-lg mt-2">
                  육아 제품 정보 제공 및 리뷰 공유
                </h3>
                <p className="text-gray-600">
                  다른 부모들의 리뷰와 제품 정보를 한눈에 확인하세요.
                </p>
              </div>
            </div>
          </section>

          {/* 추천 상품 섹션 */}
          <section className="p-12 bg-white">
            <h2 className="text-3xl font-bold text-center">
              오늘의 추천 육아템
            </h2>
            <div className="mt-8 grid grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { name: '하기스 New 네이처메이드 밴드형', price: '47,730원' },
                { name: '매일유업 앱솔루트 2FL 1단계', price: '20,430원' },
                { name: '네츄럴오가닉 퓨어 플레인 물티슈', price: '9,050원' },
                { name: '유아용 아이쿵 머리보호대', price: '17,900원' },
              ].map((product, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-100 rounded-lg shadow-md text-center"
                >
                  <div className="w-full h-40 bg-gray-300 flex justify-center items-center mb-4">
                    <span className="text-gray-600">이미지</span>
                  </div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-blue-600 font-bold mt-2">
                    {product.price}
                  </p>
                  <button className="mt-4 text-blue-600 font-semibold hover:underline">
                    최저가 확인 →
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <main className="p-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">
            👶 맞춤 유아 용품 추천
          </h2>
        </main>
      )}

      {/* 푸터 */}
      <footer className="mt-16 bg-white py-8 text-center text-gray-500 text-lg">
        © 2025 유아 용품 최저가 서비스. All Rights Reserved.
      </footer>
    </div>
  );
}
