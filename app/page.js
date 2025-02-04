'use client';

import { useState, useEffect } from 'react';

import Header from './components/header';
import HeroSection from './components/herosection';
import ConsumptionAnalysis from './components/consumptionAnalysis';
import ProductRecommendations from './components/pr_recommendation';
import Footer from './components/footer';

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['/banner1.png', '/banner2.png', '/banner3.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <HeroSection images={images} currentImage={currentImage} />
      <ConsumptionAnalysis />
      <ProductRecommendations />
      <Footer />
    </div>
  );
}
