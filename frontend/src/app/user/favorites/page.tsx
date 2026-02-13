"use client";
// Favorites Page - Trang sản phẩm yêu thích
// Beautiful list of user's favorite products

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/contexts/ToastContext";
import { getUserWishlist, removeFromWishlist } from "@/services/api/products";
import type { Product } from "@/types/products";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await getUserWishlist(user.id);
      setFavorites(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách yêu thích");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (productId: number) => {
    if (!user?.id) return;
    
    try {
      await removeFromWishlist(user.id, productId);
      setFavorites(prev => prev.filter(p => Number(p.id) !== productId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (err: any) {
      console.error("Failed to remove favorite:", err);
      setError("Không thể xóa sản phẩm khỏi danh sách yêu thích");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                Sản phẩm yêu thích
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} sản phẩm
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ErrorMessage message={error} />
          </motion.div>
        )}

        {/* Empty State */}
        {favorites.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-16 h-16 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Hãy khám phá và thêm những sản phẩm bạn yêu thích vào danh sách này
            </p>
            <Button 
              variant="primary"
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Khám phá sản phẩm
            </Button>
          </motion.div>
        )}

        {/* Products Grid */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {favorites.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={() => handleAddToCart(product)}
                    index={index}
                  />
                  
                  {/* Remove Button Overlay */}
                  <motion.button
                    onClick={() => removeFavorite(Number(product.id))}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-red-50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
