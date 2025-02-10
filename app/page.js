'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from './components/Header';
import LoginSection from './components/LoginSection';
import Loading from './components/Loading';
import HeroSection from './components/HeroSection';
import ConsumptionAnalysis from './components/ConsumptionAnalysis';
import ProductRecommendations from './components/ProductRecommendations';
import Footer from './components/Footer';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    // URL에서 회원가입 완료 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const signupComplete = urlParams.get('signupComplete');
    const token = urlParams.get('token');

    if (signupComplete && token) {
      // 토큰 저장 및 자동 로그인 처리
      localStorage.setItem('access_token', token);
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('1. Google 로그인 응답:', credentialResponse);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('2. 디코드된 Google 정보:', decoded);

      const response = await fetch('http://localhost:3001/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: decoded.sub,
        }),
      });

      const data = await response.json();
      console.log('3. 백엔드 로그인 응답:', data);

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload(); // 페이지 새로고침하여 헤더 상태 업데이트
      } else {
        const userData = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
        router.push(
          `/signup?userData=${encodeURIComponent(JSON.stringify(userData))}`
        );
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogin={handleGoogleSuccess} />
      <HeroSection />
      <ConsumptionAnalysis />
      <ProductRecommendations />
      <Footer />
    </div>
  );
}
