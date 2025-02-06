'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function HeroSection({ images = [], currentImage = 0 }) {
  return (
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
          온라인 쇼핑 예산, 아기 정보(생년월일, 성별)을 입력하면 해당 조건에
          맞는 최저가 육아 용품을 추천합니다. 월별 소비 내역 및 카테고리별 지출
          통계를 통해 육아 비용을 체계적으로 관리합니다.
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

        {/* ✅ 이미지 배너 */}
        {/* <div className="relative mt-12 flex justify-center">
          <div className="w-2/5 h-[35rem] bg-gray-200 rounded-lg shadow-md flex justify-center items-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images?.[currentImage] ?? '/default-banner.png'} // ✅ 이미지가 없을 경우 기본 배너 제공
                alt="배너 이미지"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <p className="text-gray-500">배너 이미지를 불러올 수 없습니다.</p>
            )}
          </div>
        </div> */}
      </div>
    </section>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';

// export default function HeroSection({ images, currentImage }) {
//   return (
//     <section className="text-center text-white py-20 relative overflow-hidden">
//       <div
//         className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-600"
//         style={{
//           clipPath:
//             'polygon(50% 0%, 100% 0%, 100% 55%, 70% 70%, 60% 70%, 50% 70%, 40% 70%, 30% 70%, 0% 85%, 0% 0%)',
//         }}
//       ></div>
//       <div className="relative z-10">
//         <h2 className="text-5xl font-bold">HAMA와 함께</h2>
//         <p className="mt-3 text-lg">
//           최저가 육아 용품 구매, 소비패턴 분석을 한 곳에서
//         </p>

//         <p className="mt-2 text-md max-w-2xl mx-auto">
//           온라인 쇼핑 예산, 아기 정보(생년월일, 성별)을 입력하면 해당 조건에
//           맞는 최저가 육아 용품을 추천합니다. 월별 소비 내역 및 카테고리별 지출
//           통계를 통해 육아 비용을 체계적으로 관리합니다.
//         </p>
//         <div className="mt-6 flex justify-center space-x-4">
//           <button
//             onClick={() => signIn('google')}
//             className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100"
//           >
//             로그인
//           </button>
//           <button className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-400">
//             회원가입
//           </button>
//         </div>
//         <div className="relative mt-12 flex justify-center">
//           <div className="w-2/5 h-[35rem] bg-gray-200 rounded-lg shadow-md flex justify-center items-center overflow-hidden">
//             <img
//               src={images[currentImage]}
//               alt="배너 이미지"
//               className="w-full h-full object-cover rounded-lg"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
