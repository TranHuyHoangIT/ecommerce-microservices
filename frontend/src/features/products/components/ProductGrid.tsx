// UI Component: ProductGrid

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProducts, searchProducts, type Product } from '@/services/api/products';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/contexts/ToastContext';
import { Search } from 'lucide-react';

export const ProductGrid: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const toast = useToast();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';

  useEffect(() => {
    loadProducts();
  }, [searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: Product[];
      if (searchQuery) {
        data = await searchProducts(searchQuery);
      } else {
        data = await getProducts();
      }
      setProducts(data);
    } catch (err) {
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    const success = await addToCart(product.id, 1, {
      price: product.price,
      name: product.name,
      image: product.image
    });
    if (success) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {searchQuery && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Kết quả tìm kiếm: "{searchQuery}"
              </h1>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-red-500 py-8 bg-red-50 rounded-2xl p-6"
          >
            {error}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Kết quả tìm kiếm
                </h1>
                <p className="text-gray-600 mt-1">
                  {products.length} sản phẩm cho "{searchQuery}"
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* No results */}
        {products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-600">
              Không có sản phẩm nào phù hợp với từ khóa "{searchQuery}"
            </p>
          </motion.div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={() => handleAddToCart(product)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};