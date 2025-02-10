'use client';

import { useState } from 'react';
import Header from '@/app/components/header';
import { Plus, XCircle } from 'lucide-react';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [age, setAge] = useState('');
  const [store, setStore] = useState('');
  const [isRecommended, setIsRecommended] = useState(null);
  const [images, setImages] = useState([]); // 여러 이미지를 담을 배열

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const currentImagesCount = images.length;

    // 최대 9장까지 업로드 가능
    if (currentImagesCount + files.length <= 9) {
      const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
    } else {
      alert('최대 9장까지만 업로드 가능합니다.');
    }
  };

  // 이미지 삭제 핸들러
  const handleImageDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

// ... existing code ...

const handleSubmit = async () => {
  try {
    // 필수 입력값 검증
    if (!title || !content || !age || isRecommended === null) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 이미지 업로드를 위한 FormData 생성 및 전송
    const imageFormData = new FormData();
    for (const image of images) {
      imageFormData.append('files', image.file);
    }

    // 이미지 먼저 업로드
    let imageUrls = [];
    
    if (images.length > 0) {
      try {
        const imageUploadResponse = await fetch('http://localhost:3002/upload/multiple', {
          method: 'POST',
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDU3NjM0OTE2MzE3Mjk4OTQxNjUiLCJqdGkiOiIzOTE5MzE2OS1mNmZkLTQwYTgtOTc3YS03YTIzODc1MmFkNjEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTczOTE1MDQwMywiZXhwIjoxNzM5MjM2ODAzfQ.QFPihEJ5TAqFYa0oVZ5-lCqJwQhvKTZdpMwLQ6t9C5Q`,
          },
          body: imageFormData,
        });

        if (!imageUploadResponse.ok) {
          console.error('이미지 업로드 응답:', await imageUploadResponse.text());
          throw new Error(`이미지 업로드 실패: ${imageUploadResponse.status}`);
        }

        const response = await imageUploadResponse.json();
        // response.imageUrls 배열을 직접 사용
        imageUrls = response.imageUrls || [];
        console.log('업로드된 이미지 URL:', imageUrls);
      } catch (imageError) {
        console.error('이미지 업로드 에러:', imageError);
        throw new Error('이미지 업로드 중 오류가 발생했습니다.');
      }
    }

    // 리뷰 데이터 생성 및 전송
    const reviewData = {
      name: title.trim(),
      description: content.trim(),
      ageGroup: age.trim(),
      purchaseLink: store.trim() || null,
      recommended: isRecommended,
      imageUrls: imageUrls, // 배열 형태로 직접 전달
    };

    console.log('전송할 리뷰 데이터:', reviewData);

    const reviewResponse = await fetch('http://localhost:3004/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDU3NjM0OTE2MzE3Mjk4OTQxNjUiLCJqdGkiOiIzOTE5MzE2OS1mNmZkLTQwYTgtOTc3YS03YTIzODc1MmFkNjEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTczOTE1MDQwMywiZXhwIjoxNzM5MjM2ODAzfQ.QFPihEJ5TAqFYa0oVZ5-lCqJwQhvKTZdpMwLQ6t9C5Q`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    const responseText = await reviewResponse.text();
    console.log('서버 응답:', responseText);

    if (!reviewResponse.ok) {
      let errorMessage;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message;
      } catch (e) {
        errorMessage = responseText || '리뷰 등록에 실패했습니다.';
      }
      throw new Error(errorMessage);
    }

    alert('리뷰가 성공적으로 등록되었습니다.');
    window.location.href = '/community';
    
  } catch (error) {
    alert(error.message || '리뷰 등록 중 오류가 발생했습니다.');
    console.error('Error:', error);
  }
};

// ... existing code ...

  return (
    <div className="min-h-screen ">
      <Header />

      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg mt-6">
        <h1 className="text-3xl font-bold mb-4">글 작성</h1>

        {/* 이미지 업로드 영역 */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* 첫 번째 네모칸 - 이미지 업로드 */}
          <label className="relative w-32 h-32 flex items-center justify-center bg-gray-200 rounded-lg cursor-pointer">
            <Plus size={32} />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* 업로드한 이미지들 */}
          {images.map((image, index) => (
            <div key={index} className="relative w-32 h-32 bg-gray-200 rounded-lg">
              <img src={image.preview} alt={`Uploaded ${index}`} className="w-full h-full object-cover rounded-lg" />
              <button
                className="absolute -top-2 -right-2 bg-white rounded-full"
                onClick={() => handleImageDelete(index)}
              >
                <XCircle size={20} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>

        {/* 추천/비추천 버튼 */}
        <div className="flex gap-4 mb-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
              isRecommended === true ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setIsRecommended(true)}
          >
            추천템
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
              isRecommended === false ? 'bg-red-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setIsRecommended(false)}
          >
            비추천템
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold">상품명</label>
            <input
              type="text"
              className="w-full border p-2 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold">내용</label>
            <textarea
              className="w-full border p-2 rounded-lg"
              placeholder="상품의 장/단점을 작성해 주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold">사용연령</label>
            <input
              type="text"
              className="w-full border p-2 rounded-lg"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold">구매처 (선택)</label>
            <input
              type="text"
              className="w-full border p-2 rounded-lg"
              value={store}
              onChange={(e) => setStore(e.target.value)}
            />
          </div>
        </div>

        {/* 업로드 버튼 */}
        <button className="mt-6 w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500" onClick={handleSubmit}>
          업로드
        </button>
      </div>
    </div>
  );
}