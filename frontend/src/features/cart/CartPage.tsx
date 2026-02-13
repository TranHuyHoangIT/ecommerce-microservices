// Feature: Cart Page
// E-Commerce Microservices Frontend
// Modern, responsive cart page using Tailwind CSS and shadcn/ui

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useToast } from "@/contexts/ToastContext";
import CheckoutModal, { CheckoutData } from "@/components/CheckoutModal";
import { createOrder, OrderItem } from "@/services/api/orders";
import { checkoutCart } from "@/services/api/cart";

const CartPage: React.FC = () => {
  const { cart, loading, error, removeItem, updateQuantity, refreshCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemove = (id: string) => {
    removeItem(id);
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleCheckoutClick = () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      router.push("/login");
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async (checkoutData: CheckoutData) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare order items from cart
      const orderItems: OrderItem[] = cart.map(item => ({
        product_id: parseInt(item.product_id),
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }));

      // Create order
      const order = await createOrder({
        user_id: user.id,
        user_name: user.fullName,
        user_email: user.email,
        items: orderItems,
        shipping_address: checkoutData.shipping_address,
        payment_method: checkoutData.payment_method
      });

      // Clear cart on server
      await checkoutCart();

      // Refresh cart UI
      await refreshCart();

      toast.success(`Đặt hàng thành công! Mã đơn hàng: ${order.order_number}`);
      setIsCheckoutModalOpen(false);

      // Navigate to orders page
      setTimeout(() => {
        router.push("/user/orders");
      }, 1500);

    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div 
      className="container mx-auto max-w-7xl px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ShoppingBag className="w-10 h-10 text-indigo-600" />
        Giỏ hàng của bạn
      </motion.h1>

      {cart.length === 0 ? (
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-500 text-xl">Giỏ hàng trống.</p>
          <p className="text-gray-400 mt-2">Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item.id)}
                  onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{totalAmount.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Tổng cộng:</span>
                  <motion.span
                    key={totalAmount}
                    initial={{ scale: 1.2, color: "#4f46e5" }}
                    animate={{ scale: 1, color: "#1f2937" }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    {totalAmount.toLocaleString()}₫
                  </motion.span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleCheckoutClick} 
                  variant="primary"
                  disabled={isProcessing}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Đang xử lý..." : "Thanh toán"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>

              <p className="text-sm text-gray-500 text-center mt-4">
                🔒 Thanh toán an toàn & bảo mật
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => !isProcessing && setIsCheckoutModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
        isLoading={isProcessing}
      />
    </motion.div>
  );
};

export default CartPage;
