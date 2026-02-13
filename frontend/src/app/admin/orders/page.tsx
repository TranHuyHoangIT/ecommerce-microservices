"use client";
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, cancelOrder, refundOrder, Order } from '@/services/api/admin';
import { useToast } from '@/contexts/ToastContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
  shipping: 'bg-purple-100 text-purple-700 border-purple-300',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: 'cancel' | 'refund', orderId: number} | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders(0, 100, filterStatus === 'all' ? undefined : filterStatus);
      setOrders(data);
    } catch (error) {
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast('Cập nhật trạng thái thành công', 'success');
      loadOrders();
    } catch (error) {
      showToast('Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleCancelClick = (orderId: number) => {
    setConfirmAction({type: 'cancel', orderId});
    setShowConfirmDialog(true);
  };

  const handleRefundClick = (orderId: number) => {
    setConfirmAction({type: 'refund', orderId});
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    
    try {
      if (confirmAction.type === 'cancel') {
        await cancelOrder(confirmAction.orderId, 'Hủy bởi quản trị viên');
        showToast('Đã hủy đơn hàng', 'success');
      } else {
        await refundOrder(confirmAction.orderId);
        showToast('Đã hoàn tiền đơn hàng', 'success');
      }
      loadOrders();
    } catch (error) {
      showToast(`Không thể ${confirmAction.type === 'cancel' ? 'hủy' : 'hoàn tiền'}`, 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi đơn hàng khách hàng</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard label="Tổng cộng" count={orderStats.total} color="bg-gray-100 text-gray-700" />
            <StatCard label="Chờ duyệt" count={orderStats.pending} color="bg-yellow-100 text-yellow-700" />
            <StatCard label="Đã xác nhận" count={orderStats.confirmed} color="bg-blue-100 text-blue-700" />
            <StatCard label="Đang giao" count={orderStats.shipping} color="bg-purple-100 text-purple-700" />
            <StatCard label="Đã giao" count={orderStats.delivered} color="bg-green-100 text-green-700" />
            <StatCard label="Đã hủy" count={orderStats.cancelled} color="bg-red-100 text-red-700" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {order.order_number}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">
                            {order.user_name || `User #${order.user_id}`}
                          </div>
                          {order.user_email && (
                            <div className="text-sm text-gray-500">{order.user_email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items?.length || 0} sản phẩm
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {order.total.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}
                          >
                            <option value="pending">Chờ duyệt</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="w-20 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                          >
                            Xem
                          </button>
                          {order.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleCancelClick(order.id)}
                                className="w-20 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleRefundClick(order.id)}
                                className="w-24 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                              >
                                Hoàn tiền
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Detail Modal */}
          {showDetailModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mã đơn hàng</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                      <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedOrder.status]}`}>
                        {selectedOrder.status === 'pending' ? 'Chờ duyệt' : selectedOrder.status === 'confirmed' ? 'Đã xác nhận' : selectedOrder.status === 'shipping' ? 'Đang giao' : selectedOrder.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ngày đặt hàng</label>
                      <p className="text-gray-900">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tổng tiền</label>
                      <p className="text-lg font-bold text-gray-900">{selectedOrder.total.toLocaleString('vi-VN')}₫</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Địa chỉ giao hàng</label>
                    <p className="text-gray-900 mt-1">{selectedOrder.shipping_address}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Phương thức thanh toán</label>
                    <p className="text-gray-900 mt-1">{selectedOrder.payment_method}</p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Sản phẩm</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <img src={item.image || '/placeholder.png'} alt={item.product_name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                            <p className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')}₫/sp</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => {
              setShowConfirmDialog(false);
              setConfirmAction(null);
            }}
            onConfirm={handleConfirmAction}
            title={confirmAction?.type === 'cancel' ? 'Xác nhận hủy đơn hàng' : 'Xác nhận hoàn tiền'}
            message={confirmAction?.type === 'cancel' 
              ? 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.' 
              : 'Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này?'}
            confirmText={confirmAction?.type === 'cancel' ? 'Hủy đơn' : 'Hoàn tiền'}
            cancelText="Không"
            type={confirmAction?.type === 'cancel' ? 'danger' : 'warning'}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function StatCard({ label, count, color }: any) {
  return (
    <div className={`${color} rounded-xl p-4 text-center`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}
