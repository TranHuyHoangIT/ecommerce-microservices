// SkeletonLoader.tsx
// Beautiful skeleton loading states

import { motion } from "framer-motion";

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 mx-auto"></div>
    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-2 mx-auto"></div>
    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-4 mx-auto"></div>
    <div className="h-10 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-xl w-full"></div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl"></div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
          <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl"></div>
          <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="flex gap-3">
            <div className="h-14 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-xl flex-1"></div>
            <div className="h-14 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
