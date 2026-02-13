"use client";
import { useEffect, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { getAllOrders } from '@/services/api/staff';
import { Order } from '@/services/api/orders';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function StaffOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
    loadOrders();
  }, [searchParams]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng của khách hàng</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Chờ xử lý ({statusCounts.pending})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'confirmed'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Đã xác nhận ({statusCounts.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter('shipping')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'shipping'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Đang giao ({statusCounts.shipping})
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'delivered'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Đã giao ({statusCounts.delivered})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Đã hủy ({statusCounts.cancelled})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo mã đơn hàng hoặc ID khách hàng..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <p className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy đơn hàng</p>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Mã đơn</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Khách hàng</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Sản phẩm</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Tổng tiền</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Ngày đặt</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-indigo-600">#{order.order_number}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user_name || `User #${order.user_id}`}
                          </p>
                          {order.user_email && (
                            <p className="text-sm text-gray-500">{order.user_email}</p>
                          )}
                          <p className="text-sm text-gray-500 line-clamp-1">{order.shipping_address}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {order.items.length} sản phẩm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">
                          {order.total.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/staff/orders/${order.id}`}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            Chi tiết →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
