// CartItem.tsx
// UI component for cart item
// E-Commerce Microservices Frontend

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus } from "lucide-react";
import { CartItemType } from "../types/cart";
import { Button } from "./ui/Button";

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  index?: number;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity, index = 0 }) => {
  const router = useRouter();

  const handleProductClick = () => {
    router.push(`/products/${item.product_id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05
      }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center bg-white rounded-2xl shadow-lg p-4 mb-4 hover:shadow-xl transition-shadow relative overflow-hidden group"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-24 h-24 rounded-xl object-cover mr-4 cursor-pointer shadow-md" 
          onClick={handleProductClick}
        />
      </motion.div>

      <div className="flex-1 relative z-10">
        <motion.div 
          className="font-semibold text-lg text-indigo-700 cursor-pointer hover:text-indigo-900 transition-colors mb-1"
          onClick={handleProductClick}
          whileHover={{ x: 5 }}
        >
          {item.name}
        </motion.div>
        <div className="text-gray-600 font-semibold mb-3">{item.price.toLocaleString()}₫</div>
        
        {/* Quantity controls with animation */}
        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              onClick={() => onUpdateQuantity(item.quantity - 1)} 
              disabled={item.quantity <= 1} 
              size="sm" 
              variant="outline"
              className="flex items-center justify-center w-8 h-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </motion.div>
          
          <motion.span 
            key={item.quantity}
            initial={{ scale: 1.3, color: "#4f46e5" }}
            animate={{ scale: 1, color: "#374151" }}
            className="mx-2 text-gray-700 font-bold min-w-[2rem] text-center"
          >
            {item.quantity}
          </motion.span>
          
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              onClick={() => onUpdateQuantity(item.quantity + 1)} 
              size="sm" 
              variant="outline"
              className="flex items-center justify-center w-8 h-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>

          <span className="ml-2 text-sm text-gray-500">
            = {(item.price * item.quantity).toLocaleString()}₫
          </span>
        </div>
      </div>

      {/* Remove button with animation */}
      <motion.div
        className="relative z-10"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button 
          onClick={onRemove} 
          className="ml-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl px-4 py-2 hover:from-red-600 hover:to-pink-600 shadow-md flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Xóa
        </Button>
      </motion.div>
    </motion.div>
  );
};
