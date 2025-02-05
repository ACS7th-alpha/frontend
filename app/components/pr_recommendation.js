'use client';

export default function ProductRecommendations() {
  const products = [
    { name: '하기스 New 네이처메이드 밴드형', price: '47,730원' },
    { name: '매일유업 앱솔루트 2FL 1단계', price: '20,430원' },
    { name: '네츄럴오가닉 퓨어 플레인 물티슈', price: '9,050원' },
    { name: '유아용 아이쿵 머리보호대', price: '17,900원' },
  ];

  return (
    <section className="p-12 bg-white">
      <h2 className="text-3xl font-bold text-center">오늘의 추천 육아템</h2>
      <div className="mt-8 grid grid-cols-4 gap-6 max-w-6xl mx-auto">
        {products.map((product, index) => (
          <div
            key={index}
            className="p-6 bg-gray-100 rounded-lg shadow-md text-center"
          >
            <div className="w-full h-40 bg-gray-300 flex justify-center items-center mb-4">
              <span className="text-gray-600">이미지</span>
            </div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-blue-600 font-bold mt-2">{product.price}</p>
            <button className="mt-4 text-blue-600 font-semibold hover:underline">
              최저가 확인 →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
