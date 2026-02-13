"use client";
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getDashboardStats, getRevenueData, getTopProducts, getOrdersByStatus } from '@/services/api/admin';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalUsers?: number;
  totalOrders?: number;
  totalRevenue?: number;
  totalProducts?: number;
  pending?: number;
  confirmed?: number;
  shipping?: number;
  delivered?: number;
  cancelled?: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, revenueRes, topProductsRes, orderStatusRes] = await Promise.all([
        getDashboardStats(),
        getRevenueData('daily', 30),
        getTopProducts(5),
        getOrdersByStatus(),
      ]);
      
      setStats(statsData);
      setRevenueData(revenueRes);
      setTopProducts(topProductsRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderStatusData = [
    { name: 'Pending', value: stats.pending || 0, color: '#F59E0B' },
    { name: 'Confirmed', value: stats.confirmed || 0, color: '#3B82F6' },
    { name: 'Shipping', value: stats.shipping || 0, color: '#8B5CF6' },
    { name: 'Delivered', value: stats.delivered || 0, color: '#10B981' },
    { name: 'Cancelled', value: stats.cancelled || 0, color: '#EF4444' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName || 'Admin'}!</h1>
            <p className="text-blue-100">Here's what's happening with your store today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
              icon="💰"
              color="bg-gradient-to-br from-green-500 to-green-700"
              trend="+12.5%"
            />
            <StatCard
              title="Total Orders"
              value={(stats.totalOrders || 0).toString()}
              icon="🛒"
              color="bg-gradient-to-br from-blue-500 to-blue-700"
              trend="+8.2%"
            />
            <StatCard
              title="Total Products"
              value={(stats.totalProducts || 0).toString()}
              icon="📦"
              color="bg-gradient-to-br from-purple-500 to-purple-700"
            />
            <StatCard
              title="Total Users"
              value={(stats.totalUsers || 0).toString()}
              icon="👥"
              color="bg-gradient-to-br from-orange-500 to-orange-700"
              trend="+5.7%"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Revenue Trend (30 Days)</h2>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Order Status Distribution</h2>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Top Selling Products</h2>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="product_name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="total_quantity" fill="#3B82F6" name="Quantity Sold" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total_revenue" fill="#10B981" name="Revenue ($)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard 
              title="Pending Orders"
              count={stats.pending || 0}
              icon="⏳"
              href="/admin/orders?status=pending"
              color="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
            />
            <QuickActionCard 
              title="Low Stock Items"
              count={5}
              icon="⚠️"
              href="/admin/products?stock=low"
              color="bg-red-50 border-red-200 hover:bg-red-100"
            />
            <QuickActionCard 
              title="New Users Today"
              count={12}
              icon="✨"
              href="/admin/users"
              color="bg-green-50 border-green-200 hover:bg-green-100"
            />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, icon, color, trend }: any) {
  return (
    <div className={`${color} rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {trend && (
        <p className="text-sm opacity-90">
          <span className="font-semibold">{trend}</span> from last month
        </p>
      )}
    </div>
  );
}

function QuickActionCard({ title, count, icon, href, color }: any) {
  return (
    <a href={href} className={`${color} border-2 rounded-xl p-6 transition-all cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{count}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </a>
  );
}
