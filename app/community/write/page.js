'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
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

  const handleSubmit = async () => {
    const formData = new FormData();

    // 이미지 파일 추가
    for (const image of images) {
      formData.append('files', image.file);
    }

    // 나머지 데이터 추가
    /* formData.append('title', title);
    formData.append('content', content);
    formData.append('age', age);
    formData.append('store', store);
    formData.append('isRecommended', isRecommended); */

    console.log(formData);
    try {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDU3NjM0OTE2MzE3Mjk4OTQxNjUiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzM4ODM1NTI3LCJleHAiOjE3Mzg4MzkxMjd9.jvBs7O8SwuLxHjWriNaovlZwtDgIp9cvgro4H3LUrX4'; // 실제 토큰으로 교체
      const response = await fetch('http://localhost:3002/upload/multiple', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('글이 성공적으로 업로드되었습니다.');
        // 작성 후 페이지 이동 등 추가 작업 가능
      } else {
        const errorData = await response.json();
        alert(`글 업로드 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      alert('글 업로드 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

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
            <div
              key={index}
              className="relative w-32 h-32 bg-gray-200 rounded-lg"
            >
              <img
                src={image.preview}
                alt={`Uploaded ${index}`}
                className="w-full h-full object-cover rounded-lg"
              />
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
        <button
          className="mt-6 w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
          onClick={handleSubmit}
        >
          업로드
        </button>
      </div>
    </div>
  );
}
