'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ImageSlider({ images }) {
  if (!images || images.length === 0) {
    return <div className="text-gray-500">이미지가 없습니다.</div>;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      className="w-full h-full"
    >
      {images.map((url, index) => (
        <SwiperSlide key={index} className="flex justify-center items-center">
        <div className="flex justify-center items-center w-full h-full">
          <img
            src={url}
            alt={`Product image ${index + 1}`}
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        </div>
      </SwiperSlide>
      ))}
    </Swiper>
  );
}
