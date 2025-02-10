'use client';
import { useEffect, useState } from 'react';

export default function ConsumptionAnalysis() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  // 로그인한 경우 컴포넌트를 렌더링하지 않음
  if (userInfo) {
    return null;
  }

  return (
    <section className="p-12 text-center bg-white">
      <h2 className="text-4xl font-bold mt-6 text-black">언제 어디서든</h2>
      <h2 className="text-4xl font-bold text-black">현명한 소비</h2>
      <p className="text-gray-700 text-lg mt-2">
        월별 소비 내역 및 카테고리별 지출 통계를 통해 육아 비용을 체계적으로
        관리합니다.
      </p>
      <div className="flex justify-center space-x-16 mt-10">
        <div className="text-center max-w-xs">
          <span className="text-3xl">💰</span>
          <h3 className="font-bold text-lg mt-2 text-black">
            최저가 추천으로 육아 비용 절감
          </h3>
          <p className="text-gray-600">
            최적의 가격을 분석하여 가장 합리적인 육아용품을 추천합니다.
          </p>
        </div>
        <div className="text-center max-w-xs">
          <span className="text-3xl">📊</span>
          <h3 className="font-bold text-lg mt-2 text-black">
            월별/카테고리별 소비 패턴 분석
          </h3>
          <p className="text-gray-600">
            사용자의 소비 습관을 분석하여 맞춤형 소비 관리를 지원합니다.
          </p>
        </div>
        <div className="text-center max-w-xs">
          <span className="text-3xl">🛍️</span>
          <h3 className="font-bold text-lg mt-2 text-black">
            육아 제품 정보 제공 및 리뷰 공유
          </h3>
          <p className="text-gray-600">
            다른 부모들의 리뷰와 제품 정보를 한눈에 확인하세요.
          </p>
        </div>
      </div>
    </section>
  );
}
