// UI Component: ProductCard
// Modern, beautiful product card for E-Commerce
"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
import { Product } from '../types/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  index?: number;
}

export default function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center cursor-pointer group relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
      
      {/* Stock badge with animation */}
      {product.stock < 10 && product.stock > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10"
        >
          Còn {product.stock}
        </motion.div>
      )}

      <div className="w-40 h-40 mb-4 overflow-hidden rounded-xl relative z-10">
        {product.image ? (
          <motion.img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15, rotate: 2 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="font-bold text-lg text-indigo-700 mb-2 text-center line-clamp-2 relative z-10 group-hover:text-indigo-900 transition-colors">
        {product.name}
      </div>
      
      <motion.div 
        className="text-gray-500 mb-3 font-semibold relative z-10"
        whileHover={{ scale: 1.1 }}
      >
        {product.price.toLocaleString()}₫
      </motion.div>

      {/* Animated button */}
      <motion.div
        className="relative z-10 w-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="primary" 
          size="md"
          className="w-full flex items-center justify-center gap-2"
          onClick={(e) => { 
            e.stopPropagation(); 
            onAddToCart(); 
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </Button>
      </motion.div>
    </motion.div>
  );
}
