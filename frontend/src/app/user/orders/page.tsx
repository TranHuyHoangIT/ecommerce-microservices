"use client";
// Orders Page - Quản lý đơn hàng
// Beautiful order history with status tracking

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  MapPin,
  CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrders, Order } from "@/services/api/orders";

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  shipping: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  delivered: {
    label: "Đã giao hàng",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await getUserOrders(user.id);
      setOrders(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

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
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Đơn hàng của tôi
              </h1>
              <p className="text-gray-600 mt-1">
                {orders.length} đơn hàng
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <FilterTab 
              label="Tất cả" 
              value="all" 
              selected={selectedStatus === "all"} 
              onClick={() => setSelectedStatus("all")}
              count={orders.length}
            />
            {Object.entries(statusConfig).map(([status, config]) => (
              <FilterTab
                key={status}
                label={config.label}
                value={status}
                selected={selectedStatus === status}
                onClick={() => setSelectedStatus(status)}
                count={orders.filter(o => o.status === status).length}
              />
            ))}
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
        {filteredOrders.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-16 h-16 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!
            </p>
            <Button 
              variant="primary"
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Mua sắm ngay
            </Button>
          </motion.div>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, index) => (
                <OrderCard key={order.id} order={order} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterTab({ 
  label, 
  value, 
  selected, 
  onClick, 
  count 
}: { 
  label: string; 
  value: string; 
  selected: boolean; 
  onClick: () => void;
  count: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium transition-all ${
        selected
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50 shadow"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label} {count > 0 && `(${count})`}
    </motion.button>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Header */}
      <div className={`px-6 py-4 border-b ${config.borderColor} ${config.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <p className="font-bold text-gray-900">#{order.order_number}</p>
              <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <span className={`px-4 py-2 ${config.bgColor} ${config.color} rounded-xl font-medium text-sm`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <div className="space-y-3 mb-4">
          {order.items.map(item => (
            <div key={item.product_id} className="flex items-center gap-3">
              <img 
                src={item.image || '/images/placeholder.png'} 
                alt={item.product_name}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
              </div>
              <p className="font-bold text-indigo-600">
                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-gray-700">Tổng cộng:</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {order.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{order.shipping_address}</span>
          </div>
        </div>
        <motion.button
          onClick={() => router.push(`/user/orders/${order.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors text-indigo-600 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Chi tiết
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
