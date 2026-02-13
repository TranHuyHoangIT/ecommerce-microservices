"use client";
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { getRevenueData, getTopProducts, getOrdersByStatus, getDashboardStats } from '@/services/api/admin';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [period, days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, topProductsRes, orderStatusRes] = await Promise.all([
        getDashboardStats(),
        getRevenueData(period, days),
        getTopProducts(10),
        getOrdersByStatus(),
      ]);

      setStats(statsRes);
      setRevenueData(revenueRes);
      setTopProducts(topProductsRes);
      
      // Transform order status data for pie chart
      const statusData = Object.entries(orderStatusRes.status_breakdown || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
      }));
      setOrderStatusData(statusData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
            </div>
            <div className="flex gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon="💰"
              color="from-green-500 to-emerald-600"
              change="+12.5%"
            />
            <MetricCard
              title="Total Orders"
              value={totalOrders.toString()}
              icon="🛒"
              color="from-blue-500 to-blue-600"
              change="+8.2%"
            />
            <MetricCard
              title="Avg Order Value"
              value={`$${avgOrderValue.toFixed(2)}`}
              icon="📊"
              color="from-purple-500 to-purple-600"
              change="+4.1%"
            />
            <MetricCard
              title="Products Sold"
              value={topProducts.reduce((sum, p) => sum + (p.total_quantity || 0), 0).toString()}
              icon="📦"
              color="from-orange-500 to-orange-600"
              change="+15.3%"
            />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Revenue Trend */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Top Selling Products</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#6B7280" />
                      <YAxis dataKey="product_name" type="category" width={120} stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="total_quantity" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Order Status Distribution</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Product Performance Details</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Units Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topProducts.map((product, index) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{product.product_name}</td>
                          <td className="px-6 py-4 text-gray-600">{product.total_quantity}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">${product.total_revenue?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="text-green-600 font-medium">↑ {(Math.random() * 20 + 5).toFixed(1)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function MetricCard({ title, value, icon, color, change }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        {change && (
          <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full font-medium">
            {change}
          </span>
        )}
      </div>
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
