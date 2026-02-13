"use client";
// Payment Methods Page - Quản lý phương thức thanh toán
// Manage saved payment methods

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Check,
  Building2,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaymentMethod {
  id: number;
  type: "card" | "bank" | "wallet";
  name: string;
  details: string;
  lastDigits: string;
  isDefault: boolean;
  icon: string;
}

const paymentTypeConfig = {
  card: {
    label: "Thẻ tín dụng/ghi nợ",
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  bank: {
    label: "Chuyển khoản ngân hàng",
    icon: Building2,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  wallet: {
    label: "Ví điện tử",
    icon: Wallet,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
};

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      type: "card",
      name: "Visa",
      details: "Thẻ Visa kết thúc",
      lastDigits: "4242",
      isDefault: true,
      icon: "💳"
    },
    {
      id: 2,
      type: "bank",
      name: "Vietcombank",
      details: "Tài khoản ngân hàng",
      lastDigits: "9876",
      isDefault: false,
      icon: "🏦"
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (id: number) => {
    setMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phương thức thanh toán này?")) {
      setMethods(prev => prev.filter(method => method.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                  Phương thức thanh toán
                </h1>
                <p className="text-gray-600 mt-1">
                  {methods.length} phương thức
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm mới
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Payment Methods List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {methods.map((method, index) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                index={index}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {methods.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Chưa có phương thức thanh toán
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Thêm phương thức thanh toán để thanh toán nhanh hơn
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm phương thức thanh toán
            </Button>
          </motion.div>
        )}

        {/* Add Form Modal - Basic placeholder */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Thêm phương thức thanh toán
                </h2>
                <p className="text-gray-600 mb-6">
                  Tính năng này đang được phát triển
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="w-full"
                >
                  Đóng
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PaymentMethodCard({ 
  method, 
  index,
  onSetDefault,
  onDelete
}: { 
  method: PaymentMethod; 
  index: number;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const config = paymentTypeConfig[method.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-16 h-16 ${config.bgColor} rounded-2xl flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${config.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{method.name}</h3>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Mặc định
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {method.details} ••••{method.lastDigits}
              </p>
              <p className="text-xs text-gray-500 mt-1">{config.label}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!method.isDefault && (
              <motion.button
                onClick={() => onSetDefault(method.id)}
                className="px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đặt mặc định
              </motion.button>
            )}
            <motion.button
              onClick={() => onDelete(method.id)}
              className="w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-xl transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
