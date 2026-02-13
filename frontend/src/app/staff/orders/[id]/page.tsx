"use client";
import { useEffect, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { getOrderById } from '@/services/api/orders';
import { updateOrderStatus } from '@/services/api/staff';
import { Order } from '@/services/api/orders';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(parseInt(params.id));
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
      showToast('Không thể tải thông tin đơn hàng', 'error');
      router.push('/staff/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return;

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus, note);
      showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
      await loadOrder();
      setNote('');
    } catch (error) {
      console.error('Failed to update order status:', error);
      showToast('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      pending: 'confirmed',
      confirmed: 'shipping',
      shipping: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (status: Order['status'] | null): string => {
    if (!status) return '';
    const labels: Record<Order['status'], string> = {
      pending: 'Đang chờ',
      confirmed: 'Xác nhận đơn',
      shipping: 'Giao hàng',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return labels[status];
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </StaffLayout>
    );
  }

  if (!order) {
    return (
      <StaffLayout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Không tìm thấy đơn hàng</p>
        </div>
      </StaffLayout>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <StaffLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 font-medium mb-2"
            >
              ← Quay lại
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng #{order.order_number}</h1>
            <p className="text-gray-600 mt-1">
              Đặt ngày {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-sm text-gray-600">
                        × {item.quantity} = {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-indigo-600">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Địa chỉ giao hàng</p>
                  <p className="text-gray-900 mt-1">{order.shipping_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phương thức thanh toán</p>
                  <p className="text-gray-900 mt-1">{order.payment_method}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h2>
              
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="space-y-4">
                  {nextStatus && (
                    <button
                      onClick={() => handleStatusUpdate(nextStatus)}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {updating && <LoadingSpinner size="small" />}
                      {updating ? 'Đang cập nhật...' : `→ ${getNextStatusLabel(nextStatus)}`}
                    </button>
                  )}

                  {order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy đơn hàng
                    </button>
                  )}

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Thêm ghi chú cho đơn hàng..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}

              {(order.status === 'delivered' || order.status === 'cancelled') && (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    {order.status === 'delivered' 
                      ? '✅ Đơn hàng đã hoàn thành'
                      : '❌ Đơn hàng đã bị hủy'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Thông tin nhanh</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">ID Đơn hàng</span>
                  <span className="font-semibold">#{order.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Khách hàng</span>
                  <span className="font-semibold">
                    {order.user_name || `User #${order.user_id}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Số sản phẩm</span>
                  <span className="font-semibold">{order.items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Tổng số lượng</span>
                  <span className="font-semibold">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử đơn hàng</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Đơn hàng được tạo</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Cập nhật gần nhất</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.updated_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
