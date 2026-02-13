"use client";
// UI Component: ProductCarousel
// Modern product carousel for homepage hero section

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Bộ sưu tập mùa hè 2026",
    description: "Khám phá xu hướng thời trang mới nhất với ưu đãi đến 50%",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop",
    ctaText: "Mua ngay",
    ctaLink: "/products",
    bgGradient: "from-blue-600 to-purple-600"
  },
  {
    id: 2,
    title: "Công nghệ tiên tiến",
    description: "Sản phẩm điện tử cao cấp - Giảm giá sốc cuối tuần",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop",
    ctaText: "Khám phá",
    ctaLink: "/products",
    bgGradient: "from-indigo-600 to-blue-600"
  },
  {
    id: 3,
    title: "Phong cách sang trọng",
    description: "Nâng tầm đẳng cấp với các sản phẩm cao cấp",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    ctaText: "Xem thêm",
    ctaLink: "/products",
    bgGradient: "from-purple-600 to-pink-600"
  }
];

const ProductCarousel = memo(function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const handleDotClick = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const handleCTAClick = useCallback(() => {
    router.push(slides[currentIndex].ctaLink);
  }, [currentIndex, router]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[380px] overflow-hidden rounded-3xl shadow-2xl mb-12">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image 
              src={currentSlide.image} 
              alt={currentSlide.title}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              quality={80}
              sizes="100vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient} opacity-80`}></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-between px-12 max-w-7xl mx-auto">
            <div className="text-white max-w-xl">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold mb-3 drop-shadow-lg"
              >
                {currentSlide.title}
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg mb-6 text-white/90 drop-shadow"
              >
                {currentSlide.description}
              </motion.p>
              
              <button
                onClick={handleCTAClick}
                className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold text-base shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                {currentSlide.ctaText}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-125 transition-transform" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-125 transition-transform" />
      </button>

      {/* Indicators (Dots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`transition-all ${
              index === currentIndex 
                ? 'w-12 h-3 bg-white' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/70'
            } rounded-full`}
          />
        ))}
      </div>
    </div>
  );
});

export default ProductCarousel;
