"use client";
// ProductDetailPage.tsx
// Feature: Product Detail Page with modern, beautiful UI
// E-Commerce Microservices Frontend

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, Minus, Plus, Check, Sparkles } from "lucide-react";
import { Product } from "@/types/products";
import { getProductById, getRelatedProducts, isInWishlist, addToWishlist, removeFromWishlist } from "@/services/api/products";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { ProductDetailSkeleton } from "@/components/SkeletonLoader";
import { ErrorMessage } from "@/components/ErrorMessage";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/contexts/ToastContext";

// Type guard để kiểm tra category là object có name
function isCategoryObject(category: unknown): category is { name: string } {
  return typeof category === 'object' && category !== null && 'name' in category;
}

interface ProductDetailPageProps {
  productId: string;
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    // Check if product is in wishlist when user or product changes
    if (user?.id && product?.id) {
      checkWishlistStatus();
    }
  }, [user?.id, product?.id]);

  const checkWishlistStatus = async () => {
    if (!user?.id || !product?.id) return;
    
    try {
      const inWishlist = await isInWishlist(user.id, Number(product.id));
      setIsFavorite(inWishlist);
    } catch (err) {
      console.error("Failed to check wishlist status:", err);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
      
      // Load related products
      const related = await getRelatedProducts(productId);
      setRelatedProducts(related);
      
      setLoading(false);
    } catch (err) {
      setError("Không thể tải thông tin sản phẩm");
      setLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user?.id) {
      showToast("Vui lòng đăng nhập để thêm vào yêu thích", "error");
      return;
    }

    if (!product?.id) return;

    setWishlistLoading(true);
    try {
      if (isFavorite) {
        // Remove from wishlist
        await removeFromWishlist(user.id, Number(product.id));
        setIsFavorite(false);
        showToast("Đã xóa khỏi danh sách yêu thích", "success");
      } else {
        // Add to wishlist
        await addToWishlist(user.id, Number(product.id));
        setIsFavorite(true);
        showToast("Đã thêm vào danh sách yêu thích", "success");
      }
    } catch (err: any) {
      console.error("Failed to toggle wishlist:", err);
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const success = await addToCart(product.id, quantity, {
      name: product.name,
      price: product.price,
      image: product.image
    });
    
    if (success) {
      showToast("Đã thêm vào giỏ hàng!", "success");
    } else {
      showToast("Lỗi khi thêm vào giỏ hàng", "error");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images!.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <ErrorMessage message={error || "Không tìm thấy sản phẩm"} />
      </motion.div>
    );
  }

  const displayImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = displayImages[selectedImageIndex];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section - Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Image Gallery */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Main Image */}
            <motion.div 
              className="relative bg-white rounded-3xl shadow-xl overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-square relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImageIndex}
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  />
                </AnimatePresence>
                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Ảnh trước"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Ảnh tiếp theo"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}
                
                {/* Stock Badge */}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Chỉ còn {product.stock} sản phẩm
                  </div>
                )}
                
                {product.stock === 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Hết hàng
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex
                        ? "border-indigo-600 shadow-lg scale-105"
                        : "border-gray-200 hover:border-indigo-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Brand & Category */}
            {(product.brand || product.category) && (
              <motion.div 
                className="flex gap-3 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {product.brand && (
                  <motion.span 
                    className="text-indigo-600 font-semibold"
                    whileHover={{ scale: 1.05 }}
                  >
                    {product.brand}
                  </motion.span>
                )}
                {product.category && (
                  <span className="text-gray-500">• {isCategoryObject(product.category) ? product.category.name : product.category}</span>
                )}
              </motion.div>
            )}

            {/* Product Name */}
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {product.name}
            </motion.h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (product.rating || 4)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating || 4.0} ({product.reviews_count || 0} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <div className="text-4xl font-bold text-indigo-600">
                {product.price.toLocaleString()}₫
              </div>
              {product.sku && (
                <div className="text-sm text-gray-500 mt-2">SKU: {product.sku}</div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Số lượng</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Giảm số lượng"
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-2 font-semibold text-lg min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    aria-label="Tăng số lượng"
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} sản phẩm có sẵn
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Mua ngay
                </Button>
              </motion.div>
            </motion.div>

            {/* Wishlist & Share */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <motion.button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                aria-label="Thêm vào yêu thích"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                  isFavorite
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 hover:border-red-400 text-gray-600"
                } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <motion.div
                  animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </motion.div>
                <span className="font-semibold">
                  {wishlistLoading ? "Đang xử lý..." : (isFavorite ? "Đã yêu thích" : "Yêu thích")}
                </span>
              </motion.button>
              <motion.button 
                aria-label="Chia sẻ sản phẩm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-400 text-gray-600 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Chia sẻ</span>
              </motion.button>
            </motion.div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-xl">
                <Truck className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Miễn phí vận chuyển</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-xl">
                <Shield className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Bảo hành 12 tháng</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-xl">
                <RefreshCw className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Đổi trả 7 ngày</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Tab Headers */}
          <div className="flex gap-2 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "description"
                  ? "text-indigo-600 border-b-4 border-indigo-600 -mb-0.5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "specs"
                  ? "text-indigo-600 border-b-4 border-indigo-600 -mb-0.5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "reviews"
                  ? "text-indigo-600 border-b-4 border-indigo-600 -mb-0.5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đánh giá ({product.reviews_count || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-3">
                {product.specifications && Object.entries(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-100 pb-3">
                      <div className="w-1/3 font-semibold text-gray-700">{key}</div>
                      <div className="w-2/3 text-gray-600">{value}</div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-800">Chất lượng cao</div>
                        <div className="text-sm text-gray-600">Sản phẩm chính hãng, nguồn gốc rõ ràng</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-800">Bảo hành chính hãng</div>
                        <div className="text-sm text-gray-600">Bảo hành 12 tháng trên toàn quốc</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="text-center py-12 text-gray-500">
                  Chưa có đánh giá nào cho sản phẩm này
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-900 mb-8">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  index={index}
                  onAddToCart={() => addToCart(relatedProduct.id, 1, {
                    name: relatedProduct.name,
                    price: relatedProduct.price,
                    image: relatedProduct.image
                  })}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
