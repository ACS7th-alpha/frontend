'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const { id } = params;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3004/reviews/${id}`, {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDU3NjM0OTE2MzE3Mjk4OTQxNjUiLCJqdGkiOiIzOTE5MzE2OS1mNmZkLTQwYTgtOTc3YS03YTIzODc1MmFkNjEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTczOTE1MDQwMywiZXhwIjoxNzM5MjM2ODAzfQ.QFPihEJ5TAqFYa0oVZ5-lCqJwQhvKTZdpMwLQ6t9C5Q`,
          },
        });
        
        if (!response.ok) {
          throw new Error('상품 정보를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg mt-6">
        {/* 추천/비추천 뱃지 */}
        <div className="mb-4">
          {product.recommended ? (
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-bold">
              추천템
            </span>
          ) : (
            <span className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold">
              비추천템
            </span>
          )}
        </div>

        {/* 상품명 */}
        <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

        {/* 이미지 갤러리 */}
        {product.imageUrls && product.imageUrls.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.imageUrls.map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`${product.name} 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 상품 정보 */}
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
          {/* 사용 연령 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">사용 연령</h2>
            <p className="text-gray-700">{product.ageGroup}</p>
          </div>

          {/* 구매처 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">구매처</h2>
            {product.purchaseLink ? (
              <a 
                href={product.purchaseLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {product.purchaseLink}
              </a>
            ) : (
              <p className="text-gray-500">구매처 정보가 없습니다.</p>
            )}
          </div>

          {/* 상세 설명 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">상세 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>

        {/* 작성일 */}
        {product.createdAt && (
          <div className="mt-8 text-right text-gray-500">
            작성일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}
          </div>
        )}
      </div>
    </div>
  );
}