"use client";
// Feature: User Profile Page
// E-Commerce Microservices Frontend
// Modern, responsive user profile page with update functionality

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Camera,
  Award,
  Calendar,
  MapPin
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/contexts/ToastContext";
import { updateProfile, changePassword, UserUpdate, ChangePassword } from "@/services/api/user";

const UserProfilePage: React.FC = () => {
  const { user, loading, error } = useUserProfile();
  const { logout } = useAuth();
  const toast = useToast();

  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values when user data loads
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      const updateData: UserUpdate = {};
      if (fullName !== user?.full_name) updateData.full_name = fullName;
      if (phone !== user?.phone) updateData.phone = phone;

      await updateProfile(updateData);
      toast.success("Cập nhật thông tin thành công!");
      setIsEditingProfile(false);
      // Refresh user data
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thông tin thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsSubmitting(true);
    try {
      const passwordData: ChangePassword = {
        current_password: currentPassword,
        new_password: newPassword
      };
      await changePassword(passwordData);
      toast.success("Đổi mật khẩu thành công!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Đổi mật khẩu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-5xl mx-auto text-center py-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Bạn chưa đăng nhập</h2>
            <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem thông tin tài khoản</p>
            <Button variant="primary" onClick={() => window.location.href = '/login'}>
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = {
    admin: { label: "Quản trị viên", color: "from-red-600 to-orange-600", icon: Shield },
    staff: { label: "Nhân viên", color: "from-blue-600 to-cyan-600", icon: Award },
    customer: { label: "Khách hàng", color: "from-indigo-600 to-purple-600", icon: User }
  };

  const roleInfo = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.customer;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Tài khoản của bạn
          </h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và bảo mật</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
              {/* Avatar */}
              <div className="relative mb-6">
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${roleInfo.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-4xl font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-16 translate-y-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-100">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.full_name || "Chưa cập nhật"}</h2>
                <p className="text-gray-500 text-sm mb-3">{user.email}</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${roleInfo.color} text-white rounded-full text-sm font-semibold shadow-lg`}>
                  <RoleIcon className="w-4 h-4" />
                  {roleInfo.label}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">0</p>
                  <p className="text-xs text-gray-600">Đơn hàng</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                  <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">0</p>
                  <p className="text-xs text-gray-600">Điểm</p>
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                    <p className="text-sm text-gray-500">Cập nhật thông tin của bạn</p>
                  </div>
                </div>
                {!isEditingProfile && (
                  <motion.button
                    onClick={() => setIsEditingProfile(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-200 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                  </motion.button>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user.full_name || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user.phone || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditingProfile && (
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      onClick={handleUpdateProfile}
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Lưu thay đổi
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setFullName(user.full_name || "");
                        setPhone(user.phone || "");
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Hủy
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h3>
                    <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo mật tài khoản</p>
                  </div>
                </div>
                {!isChangingPassword && (
                  <motion.button
                    onClick={() => setIsChangingPassword(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Đổi mật khẩu
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {isChangingPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <motion.button
                        onClick={handleChangePassword}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Đổi mật khẩu
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Hủy
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isChangingPassword && (
                <p className="text-sm text-gray-500 text-center">
                  Nhấn "Đổi mật khẩu" để cập nhật mật khẩu của bạn
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
