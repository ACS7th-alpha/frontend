'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import Link from 'next/link';
import ItemCard from '@/app/components/itemCard';
import ImageSlider from '@/app/components/imageslider';

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]); // 다른 글 목록을 위한 state
  const { id } = params;

  // 현재 상품 정보 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3004/reviews/${id}`);
        if (!response.ok) throw new Error('상품 정보를 불러오는데 실패했습니다.');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  // 다른 글 목록 가져오기
  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        const response = await fetch('http://localhost:3004/reviews');
        if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
        
        const data = await response.json();
        // 현재 글을 제외하고 최신순으로 정렬
        const filteredAndSorted = data
          .filter(item => item._id !== id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3); // 최대 3개만 표시

        setOtherProducts(filteredAndSorted);
      } catch (error) {
        console.error('Error fetching other products:', error);
      }
    };

    fetchOtherProducts();
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
        {/* 기존 상품 상세 정보 */}
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

        <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

        {/* 이미지 슬라이더 */}
        <div className="mb-8">
          <ImageSlider 
            images={product.imageUrls} 
            productName={product.name}
          />
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg mb-16">
          <div>
            <h2 className="text-lg font-semibold mb-2">사용 연령</h2>
            <p className="text-gray-700">{product.ageGroup}</p>
          </div>

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

          <div>
            <h2 className="text-lg font-semibold mb-2">상세 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>

        {/* 다른 글 목록 섹션 */}
        <div className="mt-16 border-t pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">다른 글 더 보러가기</h2>
            <Link 
              href="/community" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              전체보기
            </Link>
          </div>
          
          <div className="space-y-8">
            {otherProducts.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}