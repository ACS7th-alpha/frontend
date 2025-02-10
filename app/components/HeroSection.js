'use client';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  console.log('=== HeroSection Component Render Start ===');

  const [userInfo, setUserInfo] = useState(null);
  const [childAge, setChildAge] = useState(null);

  useEffect(() => {
    console.log('=== useEffect Triggered ===');
    // 로컬 스토리지에서 사용자 정보 가져오기
    const userData = localStorage.getItem('user');
    console.log('Raw userData from localStorage:', userData);

    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('==== User Data Debug ====');
      console.log('Full userInfo object:', parsedUser);
      console.log('Profile image property:', {
        photo: parsedUser.photo,
        picture: parsedUser.picture,
        photoURL: parsedUser.photoURL,
        profileImage: parsedUser.profileImage,
      });
      setUserInfo(parsedUser);

      // 아기의 개월 수 계산
      if (parsedUser.children && parsedUser.children[0]) {
        console.log('Child Data:', parsedUser.children[0]);
        const birthDate = new Date(parsedUser.children[0].birthdate);
        const today = new Date();
        const monthDiff =
          (today.getFullYear() - birthDate.getFullYear()) * 12 +
          (today.getMonth() - birthDate.getMonth());
        console.log('Calculated Child Age:', monthDiff);
        setChildAge(monthDiff);
      } else {
        console.log('No child data found');
      }
    } else {
      console.log('No user data in localStorage');
    }
  }, []);

  console.log('Current State:', { userInfo, childAge });

  return (
    <>
      {userInfo ? (
        // 로그인 상태: 하얀색 배경
        <div className="bg-white w-full">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                {console.log('Before rendering image - userInfo:', userInfo)}
                {userInfo.photo && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                    <img
                      src={userInfo.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-800">
                  {userInfo.nickname}
                </h2>
                {childAge !== null && (
                  <p className="text-lg mt-1 text-gray-600">{childAge}개월</p>
                )}
              </div>

              <div className="flex-1 ml-10">
                <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                  <div className="mb-2 text-left">
                    <p className="text-gray-800">이번 달 예산</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {userInfo.monthlyBudget?.toLocaleString()}원
                    </p>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-gray-600">
                    <span>사용금액: 594,000원</span>
                    <span>남은금액: 396,000원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 비로그인 상태: 기존 디자인
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
            <p className="mt-3 text-2xl">
              최저가 육아 용품 구매,
              <br />
              소비패턴 분석을 한 곳에서
            </p>
            <p className="mt-2 text-md max-w-2xl mx-auto">
              온라인 쇼핑 예산, 아기 정보(생년월일, 성별)을 입력하면
              <br />
              해당 조건에 맞는 최저가 육아 용품을 추천합니다.
              <br />
              월별 소비 내역 및 카테고리별 지출 통계를 통해 육아 비용을
              체계적으로 관리합니다.
            </p>
            <div className="relative mt-12 flex justify-center">
              <div className="w-2/5 h-[35rem] bg-gray-200 rounded-lg shadow-md flex justify-center items-center overflow-hidden">
                <img
                  src="/default-banner.png"
                  alt="배너 이미지"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
