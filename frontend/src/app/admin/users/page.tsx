"use client";
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, updateUserStatus, createUser, updateUser, deleteUser, User, CreateUserData, CreateUserResponse } from '@/services/api/admin';
import { useToast } from '@/contexts/ToastContext';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-300',
  staff: 'bg-blue-100 text-blue-700 border-blue-300',
  customer: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{id: number, currentStatus: boolean} | null>(null);
  
  // Create/Edit User Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    full_name: '',
    phone: '',
    role: 'customer'
  });
  
  // Delete User States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Temp Password Modal (after user creation)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<CreateUserResponse | null>(null);
  
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      showToast('Cập nhật vai trò thành công', 'success');
      loadUsers();
    } catch (error) {
      showToast('Không thể cập nhật vai trò', 'error');
    }
  };

  const handleStatusToggleClick = (userId: number, currentStatus: boolean) => {
    setUserToToggle({id: userId, currentStatus});
    setShowConfirmDialog(true);
  };

  const handleConfirmToggle = async () => {
    if (!userToToggle) return;
    
    const action = userToToggle.currentStatus ? 'chặn' : 'mở khóa';
    try {
      await updateUserStatus(userToToggle.id, !userToToggle.currentStatus);
      showToast(`Đã ${action} người dùng`, 'success');
      loadUsers();
    } catch (error) {
      showToast(`Không thể ${action} người dùng`, 'error');
    } finally {
      setUserToToggle(null);
    }
  };

  // Create User Handlers
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'customer'
    });
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role as 'customer' | 'staff'
    });
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'customer'
    });
  };

  const handleSaveUser = async () => {
    if (!formData.email || !formData.full_name) {
      showToast('Vui lòng điền email và họ tên', 'error');
      return;
    }

    try {
      // Clean data: remove empty phone field
      const cleanData = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        ...(formData.phone && formData.phone.trim() ? { phone: formData.phone } : {})
      };

      if (isEditMode && selectedUser) {
        // Edit existing user
        await updateUser(selectedUser.id, cleanData);
        showToast('Cập nhật người dùng thành công', 'success');
      } else {
        // Create new user
        const result = await createUser(cleanData);
        setCreatedUserData(result);
        setShowPasswordModal(true);
        showToast('Tạo người dùng thành công', 'success');
      }
      handleCloseUserModal();
      loadUsers();
    } catch (error: any) {
      // Parse error message properly
      let errorMessage = `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} người dùng`;
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // If detail is array of validation errors (Pydantic format)
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
            return `${field}: ${err.msg}`;
          }).join(', ');
        } 
        // If detail is string
        else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      showToast(errorMessage, 'error');
    }
  };

  // Delete User Handlers
  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      showToast('Xóa người dùng thành công', 'success');
      loadUsers();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Không thể xóa người dùng', 'error');
    } finally {
      setUserToDelete(null);
    }
  };


  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'blocked' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    customer: users.filter(u => u.role === 'customer').length,
    active: users.filter(u => u.is_active).length,
    blocked: users.filter(u => !u.is_active).length,
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
              <p className="text-gray-600 mt-1">Quản lý tài khoản và phân quyền</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              + Thêm Người dùng
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard label="Tổng số" count={userStats.total} color="bg-gray-100 text-gray-700" icon="👥" />
            <StatCard label="Admin" count={userStats.admin} color="bg-purple-100 text-purple-700" icon="👑" />
            <StatCard label="Nhân viên" count={userStats.staff} color="bg-blue-100 text-blue-700" icon="👔" />
            <StatCard label="Khách hàng" count={userStats.customer} color="bg-green-100 text-green-700" icon="🛍️" />
            <StatCard label="Hoạt động" count={userStats.active} color="bg-green-100 text-green-700" icon="✅" />
            <StatCard label="Đã chặn" count={userStats.blocked} color="bg-red-100 text-red-700" icon="🚫" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
              <option value="customer">Khách hàng</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Đã chặn</option>
            </select>
          </div>

          {/* Users Table */}
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sđt</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-600">#{user.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">User ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${roleColors[user.role]}`}
                          >
                            <option value="customer">Khách hàng</option>
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.is_active ? 'Hoạt động' : 'Đã chặn'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {user.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(user)}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition text-sm font-medium"
                                  title="Chỉnh sửa"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleStatusToggleClick(user.id, user.is_active)}
                                  className={`px-3 py-1.5 rounded-lg transition text-sm font-medium ${
                                    user.is_active
                                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                  title={user.is_active ? 'Chặn' : 'Mở khóa'}
                                >
                                  {user.is_active ? '🚫' : '✅'}
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteDialog(user)}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition text-sm font-medium"
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                            {user.role === 'admin' && (
                              <span className="px-3 py-1.5 text-gray-400 text-xs italic">
                                Không thể thao tác
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bulk Actions Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Hướng dẫn quản lý người dùng</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Admin:</strong> Quyền truy cập đầy đủ tất cả chức năng hệ thống</li>
                  <li>• <strong>Nhân viên:</strong> Quản lý sản phẩm và đơn hàng</li>
                  <li>• <strong>Khách hàng:</strong> Xem và mua sản phẩm</li>
                  <li>• Người dùng bị chặn không thể đăng nhập vào hệ thống</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirm Dialog - Block/Unblock */}
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => {
              setShowConfirmDialog(false);
              setUserToToggle(null);
            }}
            onConfirm={handleConfirmToggle}
            title={userToToggle?.currentStatus ? 'Xác nhận chặn người dùng' : 'Xác nhận mở khóa người dùng'}
            message={userToToggle?.currentStatus 
              ? 'Bạn có chắc chắn muốn chặn người dùng này? Người dùng sẽ không thể đăng nhập vào hệ thống.' 
              : 'Bạn có chắc chắn muốn mở khóa người dùng này?'}
            confirmText={userToToggle?.currentStatus ? 'Chặn' : 'Mở khóa'}
            cancelText="Hủy"
            type={userToToggle?.currentStatus ? 'danger' : 'info'}
          />

          {/* Confirm Dialog - Delete User */}
          <ConfirmDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setUserToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Xác nhận xóa người dùng"
            message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.full_name || userToDelete?.email}"? Hành động này không thể hoàn tác.`}
            confirmText="Xóa"
            cancelText="Hủy"
            type="danger"
          />

          {/* Create/Edit User Modal */}
          {showUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {isEditMode ? '✏️ Chỉnh sửa Người dùng' : '➕ Thêm Người dùng Mới'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={isEditMode}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0901234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as 'customer' | 'staff'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                    </select>
                  </div>

                  {!isEditMode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        💡 Mật khẩu tạm thời sẽ được tự động tạo và gửi đến email của người dùng.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCloseUserModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                  >
                    {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Temp Password Display Modal */}
          {showPasswordModal && createdUserData && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Tạo Người dùng Thành công!</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Thông tin đăng nhập:</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Email:</span>
                        <p className="font-mono font-bold text-gray-900">{createdUserData.user.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Mật khẩu tạm thời:</span>
                        <p className="font-mono font-bold text-blue-600 text-lg bg-white px-3 py-2 rounded border-2 border-blue-200">
                          {createdUserData.temp_password}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg p-3 ${createdUserData.email_sent ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <p className={`text-sm ${createdUserData.email_sent ? 'text-green-800' : 'text-orange-800'}`}>
                      {createdUserData.email_sent 
                        ? '✅ Email đã được gửi thành công đến người dùng.' 
                        : '⚠️ Không thể gửi email. Vui lòng chia sẻ mật khẩu với người dùng.'}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Lưu ý:</strong> Mật khẩu này chỉ hiển thị một lần. Vui lòng lưu lại hoặc chụp ảnh màn hình.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCreatedUserData(null);
                  }}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function StatCard({ label, count, color, icon }: any) {
  return (
    <div className={`${color} rounded-xl p-4 text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}
