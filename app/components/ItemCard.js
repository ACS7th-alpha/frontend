import Link from 'next/link';

export default function ItemCard({ item }) {
  return (
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
  );
}