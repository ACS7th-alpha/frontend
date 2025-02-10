'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ProductRecommendations() {
  const [userInfo, setUserInfo] = useState({});
  const [childAge, setChildAge] = useState(null);
  const [childName, setChildName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('기저귀/물티슈');
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const products = {
    '기저귀/물티슈': [
      { name: '하기스 New 네이처메이드 밴드형', price: '47,730원' },
      { name: '다른 기저귀 상품', price: '30,000원' },
      { name: '기저귀 상품3', price: '25,000원' },
      { name: '기저귀 상품4', price: '20,000원' },
      { name: '기저귀 상품5', price: '22,000원' },
      { name: '기저귀 상품6', price: '24,000원' },
      { name: '기저귀 상품7', price: '26,000원' },
      { name: '기저귀 상품8', price: '28,000원' },
    ],
    '생활/위생용품': [
      { name: '생활용품 상품1', price: '10,000원' },
      { name: '생활용품 상품2', price: '15,000원' },
      { name: '생활용품 상품3', price: '12,000원' },
      { name: '생활용품 상품4', price: '18,000원' },
      { name: '생활용품 상품5', price: '20,000원' },
      { name: '생활용품 상품6', price: '22,000원' },
      { name: '생활용품 상품7', price: '24,000원' },
      { name: '생활용품 상품8', price: '26,000원' },
    ],
    // 다른 카테고리와 브랜드에 대한 상품 추가
  };

  const totalSlides = Math.ceil((products['기저귀/물티슈']?.length || 0) / 4);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserInfo(parsedUser);

        if (parsedUser.children && parsedUser.children[0]) {
          const birthDate = new Date(parsedUser.children[0].birthdate);
          const today = new Date();
          const monthDiff =
            (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());
          setChildAge(monthDiff);
          setChildName(parsedUser.children[0].name);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const categories = [
    { name: '기저귀/물티슈' },
    { name: '생활/위생용품' },
    { name: '수유/이유용품' },
    { name: '스킨케어/화장품' },
    { name: '침구류' },
  ];

  const currentProducts = selectedCategory ? products[selectedCategory] : [];

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (_, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // 커스텀 화살표 컴포넌트
  function NextArrow(props) {
    const { onClick } = props;
    return (
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 border-2 border-gray-200"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="black"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    );
  }

  function PrevArrow(props) {
    const { onClick } = props;
    return (
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 border-2 border-gray-200"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="black"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
    );
  }

  // 로그인하지 않은 경우를 위한 미리보기 상품들
  const previewProducts = [
    { name: '하기스 New 네이처메이드 밴드형', price: '47,730원' },
    { name: '다른 기저귀 상품', price: '30,000원' },
    { name: '기저귀 상품3', price: '25,000원' },
    { name: '기저귀 상품4', price: '20,000원' },
  ];

  return (
    <section className="px-4 py-8 bg-white">
      <div className="max-w-[1400px] mx-auto">
        {!userInfo.name ? (
          // 로그인하지 않은 경우
          <div>
            <h2 className="text-2xl font-bold mb-6 text-black text-left">
              인기 상품
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {previewProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-lg overflow-hidden"
                >
                  <div className="w-full h-48 bg-gray-200 flex justify-center items-center">
                    <span className="text-gray-400">상품 이미지</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-medium text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {product.price}
                    </p>
                    <button className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center bg-white px-3 py-1 rounded">
                      최저가 확인 <span className="ml-1">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // 로그인한 경우 - 기존 코드
          <>
            {childAge !== null && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-black text-left">
                  {childAge}개월, 준비 리스트
                </h2>
                <div className="relative px-8">
                  <div className="absolute right-12 -top-12 z-10">
                    <span className="text-xl text-gray-600">
                      {Math.floor(currentSlide / 4) + 1}/{totalSlides}
                    </span>
                  </div>
                  <Slider {...sliderSettings}>
                    {products['기저귀/물티슈']
                      .slice(0, 12)
                      .map((product, index) => (
                        <div key={index} className="px-4">
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <div className="w-full h-48 bg-gray-200 flex justify-center items-center">
                              <span className="text-gray-400">상품 이미지</span>
                            </div>
                            <div className="p-4">
                              <h3 className="text-base font-medium text-gray-800 mb-2">
                                {product.name}
                              </h3>
                              <p className="text-lg font-bold text-gray-900">
                                {product.price}
                              </p>
                              <button className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center bg-white px-3 py-1 rounded">
                                최저가 확인 <span className="ml-1">→</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </Slider>
                </div>
              </>
            )}

            {userInfo.name && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-black text-left mt-16">
                  {userInfo.name}에게 추천하는 상품
                </h2>
                <div className="relative px-8">
                  <div className="absolute right-12 -top-12 z-10">
                    <span className="text-xl text-gray-600">
                      {Math.floor(currentSlide / 4) + 1}/
                      {Math.ceil(products['생활/위생용품'].length / 4)}
                    </span>
                  </div>
                  <Slider {...sliderSettings}>
                    {products['생활/위생용품']
                      .slice(0, 12)
                      .map((product, index) => (
                        <div key={index} className="px-4">
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <div className="w-full h-48 bg-gray-200 flex justify-center items-center">
                              <span className="text-gray-400">상품 이미지</span>
                            </div>
                            <div className="p-4">
                              <h3 className="text-base font-medium text-gray-800 mb-2">
                                {product.name}
                              </h3>
                              <p className="text-lg font-bold text-gray-900">
                                {product.price}
                              </p>
                              <button className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center bg-white px-3 py-1 rounded">
                                최저가 확인 <span className="ml-1">→</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </Slider>
                </div>
              </>
            )}

            {childName && (
              <h2 className="text-2xl font-bold mb-6 text-black text-left">
                {childName}맘 주목 카테고리
              </h2>
            )}
            <div className="flex space-x-8 mb-12">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="w-32 h-32 bg-gray-200 rounded-full mb-2"></div>
                  <p className="text-gray-800">{category.name}</p>
                </div>
              ))}
            </div>

            {selectedCategory && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                  {currentProducts.slice(0, 8).map((product, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <div className="w-full h-48 bg-gray-200 flex justify-center items-center">
                        <span className="text-gray-400">상품 이미지</span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-medium text-gray-800 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                          {product.price}
                        </p>
                        <button className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center bg-white px-3 py-1 rounded">
                          최저가 확인 <span className="ml-1">→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center -mt-6">
                  <button
                    className="text-lg font-medium text-gray-600 border-[2.5px] border-black rounded-full px-8 py-3 bg-white hover:bg-gray-50 shadow-md"
                    onClick={() => router.push('/more-products')}
                  >
                    더보기
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
