'use client';

import { useState } from 'react';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  // 필터 상태
  const [showRecommended, setShowRecommended] = useState(true);
  const [showNotRecommended, setShowNotRecommended] = useState(true);
  const router = useRouter();

  // 샘플 데이터
  const items = [
    { id: 1, name: '상품명', description: '내용', age: '사용연령', receipt: '구매처(선택)', recommended: true },
    { id: 2, name: '상품명', description: '내용', age: '사용연령', receipt: '구매처(선택)', recommended: false },
    { id: 3, name: '상품명', description: '내용', age: '사용연령', receipt: '구매처(선택)', recommended: true },
  ];

  // 필터링된 아이템
  const filteredItems = items.filter(
    (item) =>
      (showRecommended && item.recommended) ||
      (showNotRecommended && !item.recommended)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ 상단 헤더 */}
      <Header />

      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg mt-6">
        <h1 className="text-4xl font-bold mb-4">육아 아이템 공유 커뮤니티</h1>
        <p className="text-xl font-medium mb-12">이곳에서 육아 아이템을 공유하고 정보를 나눠보세요!</p>

        {/* ✅ 필터 체크박스 */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-xl flex items-center gap-2">
            <input
              type="checkbox"
              checked={showRecommended}
              onChange={() => setShowRecommended(!showRecommended)}
            />
            추천템
          </label>
          <label className="text-xl flex items-center gap-2">
            <input
              type="checkbox"
              checked={showNotRecommended}
              onChange={() => setShowNotRecommended(!showNotRecommended)}
            />
            비추천템
          </label>
        </div>

        {/* ✅ 글 작성 버튼 */}
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg float-right mb-4"
        onClick={() => router.push('/community/write')}>
          글 작성
        </button>

        {/* ✅ 아이템 목록 */}
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center bg-gray-50 p-4 rounded-lg shadow">
              {/* 이미지 박스 */}
              <div className="w-32 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">📷</span>
              </div>

              {/* 정보 */}
              <div className="ml-6 flex-1">
                {item.recommended && (
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    추천템
                  </div>
                )}
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-sm text-gray-600">{item.age}</p>
                <p className="text-sm text-gray-600">{item.receipt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
