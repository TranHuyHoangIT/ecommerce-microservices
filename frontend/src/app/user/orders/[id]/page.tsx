"use client";
// Order Detail Page - Chi tiết đơn hàng
// E-Commerce Microservices Frontend

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  User
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { getOrderById, Order } from "@/services/api/orders";

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    gradient: "from-yellow-500 to-orange-500"
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-cyan-500"
  },
  shipping: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    gradient: "from-purple-500 to-pink-500"
  },
  delivered: {
    label: "Đã giao hàng",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    gradient: "from-green-500 to-emerald-500"
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    gradient: "from-red-500 to-rose-500"
  }
};

const statusSteps = [
  { key: "pending", label: "Chờ xác nhận", icon: Clock },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle },
  { key: "shipping", label: "Đang giao", icon: Truck },
  { key: "delivered", label: "Hoàn thành", icon: Package }
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const orderId = parseInt(params.id as string);
      const data = await getOrderById(orderId);
      setOrder(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-5xl mx-auto py-20">
          <ErrorMessage message={error} />
          <div className="text-center mt-6">
            <Button onClick={() => router.push("/user/orders")} variant="outline">
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-5xl mx-auto py-20 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-500 mt-2">Đơn hàng này có thể đã bị xóa hoặc không tồn tại</p>
          <div className="mt-6">
            <Button onClick={() => router.push("/user/orders")} variant="outline">
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;
  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.push("/user/orders")}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Chi tiết đơn hàng
              </h1>
              <p className="text-gray-600 mt-2">Mã đơn hàng: <span className="font-semibold text-indigo-600">{order.order_number}</span></p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            {order.status !== "cancelled" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-indigo-600" />
                  Trạng thái đơn hàng
                </h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className={`h-full bg-gradient-to-r ${statusInfo.gradient} transition-all duration-500`}
                      style={{ width: `${(currentStatusIndex + 1) / statusSteps.length * 100}%` }}
                    />
                  </div>

                  {/* Status Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-3 ${
                              isCompleted 
                                ? `bg-gradient-to-br ${statusInfo.gradient} text-white` 
                                : "bg-gray-200 text-gray-400"
                            } ${isCurrent ? "ring-4 ring-indigo-200" : ""}`}
                          >
                            <StepIcon className="w-6 h-6" />
                          </motion.div>
                          <span className={`text-sm font-medium text-center ${
                            isCompleted ? "text-gray-800" : "text-gray-400"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                Sản phẩm ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.product_name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-semibold text-indigo-600 mt-2">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{order.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Tổng cộng:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                      {order.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Địa chỉ giao hàng
              </h2>
              <p className="text-gray-700 leading-relaxed">{order.shipping_address}</p>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Phương thức thanh toán
              </h2>
              <p className="text-gray-700">
                {order.payment_method === "COD" && "Thanh toán khi nhận hàng (COD)"}
                {order.payment_method === "BANK_TRANSFER" && "Chuyển khoản ngân hàng"}
                {order.payment_method === "CREDIT_CARD" && "Thẻ tín dụng/ghi nợ"}
              </p>
            </motion.div>

            {/* Order Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Thời gian
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đặt hàng:</span>
                  <span className="text-gray-800 font-medium">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="text-gray-800 font-medium">
                    {new Date(order.updated_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h2 className="text-lg font-bold mb-2">Cần hỗ trợ?</h2>
              <p className="text-sm text-indigo-100 mb-4">
                Liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc nào về đơn hàng
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>1900 xxxx</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>support@shop.com</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
