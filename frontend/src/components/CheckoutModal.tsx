"use client";
// CheckoutModal.tsx
// Modal for checkout with shipping and payment information
// E-Commerce Microservices Frontend

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CreditCard, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutData) => void;
  isLoading?: boolean;
}

export interface CheckoutData {
  shipping_address: string;
  payment_method: string;
}

export default function CheckoutModal({ isOpen, onClose, onSubmit, isLoading = false }: CheckoutModalProps) {
  const [formData, setFormData] = useState<CheckoutData>({
    shipping_address: "",
    payment_method: "COD"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.shipping_address.trim()) {
      onSubmit(formData);
    }
  };

  const paymentMethods = [
    { value: "COD", label: "Thanh toán khi nhận hàng (COD)", icon: Truck },
    { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: CreditCard },
    { value: "CREDIT_CARD", label: "Thẻ tín dụng/ghi nợ", icon: CreditCard },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Xác nhận đặt hàng</h2>
                <p className="text-indigo-100 text-sm">Vui lòng điền thông tin giao hàng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Shipping Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Địa chỉ giao hàng
              </label>
              <textarea
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                required
                rows={4}
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                * Vui lòng nhập đầy đủ: Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Phương thức thanh toán
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <motion.label
                      key={method.value}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.payment_method === method.value
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={formData.payment_method === method.value}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        disabled={isLoading}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.payment_method === method.value
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700">{method.label}</span>
                    </motion.label>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-3"
                >
                  Hủy
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !formData.shipping_address.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
