"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const [showRecommended, setShowRecommended] = useState(true);
  const [showNotRecommended, setShowNotRecommended] = useState(true);
  const [items, setItems] = useState([]);
  const router = useRouter();

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/community/posts");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching community posts:", error);
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
        <p className="text-xl font-medium mb-12">
          이곳에서 육아 아이템을 공유하고 정보를 나눠보세요!
        </p>

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
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg float-right mb-4"
          onClick={() => router.push("/community/write")}
        >
          글 작성
        </button>

        {/* 아이템 목록 */}
        <div className="space-y-10">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-4 rounded-lg shadow cursor-pointer"
                onClick={() => router.push(`/community/${item.id}`)}
              >
                <div className="w-56 h-56 bg-gray-200 flex items-center justify-center rounded-lg">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-500">이미지 없음</span>
                  )}
                </div>
                <div className="ml-6 flex-1">
                  {item.recommended && (
                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                      추천템
                    </div>
                  )}
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm text-gray-600">사용 연령: {item.age}</p>
                  <p className="text-sm text-gray-600">
                    구매처: {item.receipt || "미기재"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">
              등록된 게시글이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
