"use client";
import { useEffect, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import StatCard from '@/components/StatCard';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getStaffStats, StaffStats } from '@/services/api/staff';
import { getAllOrders } from '@/services/api/staff';
import { Order } from '@/services/api/orders';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        getStaffStats(),
        getAllOrders({ limit: 5 })
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.orders);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <StaffLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Tổng quan</h1>
          <p className="text-indigo-100">Chào mừng bạn đến với bảng điều khiển nhân viên</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng sản phẩm"
            value={stats?.total_products || 0}
            icon="📦"
            color="blue"
            onClick={() => router.push('/staff/products')}
          />
          <StatCard
            title="Sắp hết hàng"
            value={stats?.low_stock_products || 0}
            icon="⚠️"
            color="yellow"
            onClick={() => router.push('/staff/products?filter=low-stock')}
          />
          <StatCard
            title="Đơn chờ xử lý"
            value={stats?.pending_orders || 0}
            icon="🕐"
            color="red"
            onClick={() => router.push('/staff/orders?status=pending')}
          />
          <StatCard
            title="Đang giao hàng"
            value={stats?.shipping_orders || 0}
            icon="🚚"
            color="purple"
            onClick={() => router.push('/staff/orders?status=shipping')}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Đã xác nhận</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.confirmed_orders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Đã giao</p>
                <p className="text-2xl font-bold text-green-600">{stats?.delivered_orders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="text-2xl">📬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Đã hủy</p>
                <p className="text-2xl font-bold text-red-600">{stats?.cancelled_orders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100 mb-1">Doanh thu tháng</p>
                <p className="text-2xl font-bold">
                  {(stats?.total_revenue_month || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
            <Link
              href="/staff/orders"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Xem tất cả
              <span>→</span>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl mb-2 block">📭</span>
              Chưa có đơn hàng nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã đơn</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tổng tiền</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày tạo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-medium text-indigo-600">#{order.order_number}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {order.user_name || `User #${order.user_id}`}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          {order.total.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/staff/orders/${order.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Chi tiết →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/staff/products/new"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-all hover:transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Thêm sản phẩm mới</h3>
                <p className="text-blue-100">Tạo sản phẩm mới trong hệ thống</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">➕</span>
              </div>
            </div>
          </Link>

          <Link
            href="/staff/orders?status=pending"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-all hover:transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Đơn hàng chờ xử lý</h3>
                <p className="text-purple-100">Xem và xử lý đơn hàng mới</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">⏰</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </StaffLayout>
  );
}
