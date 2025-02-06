// app/page.js

'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Header from './components/header';
import Loading from './components/loading';
import HeroSection from './components/herosection';
import ConsumptionAnalysis from './components/consumptionAnalysis';
import ProductRecommendations from './components/pr_recommendation';
import Footer from './components/footer';
import BudgetManagement from './components/BudgetManagement';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [currentImage, setCurrentImage] = useState(0);
  const [showBudgetManagement, setShowBudgetManagement] = useState(false); // 예산 관리 페이지 상태 추가

  const images = [
    '/image/banner1.png',
    '/image/banner2.png',
    '/image/banner3.png',
  ];

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('✅ 로그인 감지, 회원 정보 확인 중...');

      fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (!res.ok) {
            // ✅ 백엔드에서 401 응답을 보낼 경우
            if (res.status === 401) {
              console.warn('⚠️ 회원가입 필요, 쿠키 설정 및 리디렉트');

              // ✅ 회원가입 플래그 쿠키 설정 (Middleware에서 감지)
              document.cookie = 'signupRequired=true; path=/';

              // ✅ 회원가입 페이지로 이동
              router.push('/signup');
              return null;
            }
            throw new Error(`❌ 서버 오류: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            console.log('✅ 유저 데이터 확인 완료:', data);
          }
        })
        .catch((error) => {
          console.error('🚨 회원 정보 확인 중 오류 발생:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) return <Loading />;
  return (
    <div className="min-h-screen bg-gray-100">
      <Header onBudgetClick={() => setShowBudgetManagement(true)} />{' '}
      {/* 예산 버튼 클릭 핸들러 추가 */}
      {showBudgetManagement ? (
        <BudgetManagement onBack={() => setShowBudgetManagement(false)} />
      ) : (
        <>
          <HeroSection images={images} currentImage={currentImage} />
          <ConsumptionAnalysis />
          <ProductRecommendations />
        </>
      )}
      <Footer />
    </div>
  );
}
