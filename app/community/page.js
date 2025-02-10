'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import Link from 'next/link';

export default function CommunityPage() {
  const [showRecommended, setShowRecommended] = useState(true);
  const [showNotRecommended, setShowNotRecommended] = useState(true);
  const [items, setItems] = useState([]);
  
  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:3004/reviews', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDU3NjM0OTE2MzE3Mjk4OTQxNjUiLCJqdGkiOiIzOTE5MzE2OS1mNmZkLTQwYTgtOTc3YS03YTIzODc1MmFkNjEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTczOTE1MDQwMywiZXhwIjoxNzM5MjM2ODAzfQ.QFPihEJ5TAqFYa0oVZ5-lCqJwQhvKTZdpMwLQ6t9C5Q`,
          },
        });
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('받아온 데이터:', data);

        // createdAt 기준으로 최신순 정렬
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // 내림차순 정렬 (최신순)
        });

        console.log('정렬된 데이터:', sortedData);
        setItems(sortedData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchItems();
  }, []);
  
  // 필터링된 아이템
  const filteredItems = items.filter(
    (item) =>
      (showRecommended && item.recommended) ||
      (showNotRecommended && !item.recommended)
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg mt-6">
        <h1 className="text-4xl font-bold mb-4">육아 아이템 공유 커뮤니티</h1>
        <p className="text-xl font-medium mb-12">이곳에서 육아 아이템을 공유하고 정보를 나눠보세요!</p>

        {/* 필터 체크박스 */}
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

        {/* 글 작성 버튼 */}
        <Link 
          href="/community/write"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg float-right mb-4"
        >
          글 작성
        </Link>

        {/* 아이템 목록 */}
        <div className="space-y-10">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Link 
                key={item._id}
                href={`/community/${item._id}`}
                className="block"
              >
                <div className="flex items-center p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="w-56 h-56 bg-gray-200 flex items-center justify-center rounded-lg">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <img 
                        src={item.imageUrls[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <span className="text-gray-500">이미지 없음</span>
                    )}
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      {item.recommended ? (
                        <span className="text-blue-600 font-bold">추천템</span>
                      ) : (
                        <span className="text-red-600 font-bold">비추천템</span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-600">사용 연령: {item.ageGroup}</p>
                    <p className="text-sm text-gray-600">
                      구매처: {item.purchaseLink || '미기재'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-600">등록된 게시글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}