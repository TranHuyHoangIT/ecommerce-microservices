"use client";
// UserDropdown.tsx
// Beautiful dropdown menu for user account actions

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChevronDown,
  Package,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserDropdownProps {
  className?: string;
}

export default function UserDropdown({ className = "" }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Menu items for admin - simple and minimal
  const adminMenuItems = [
    {
      icon: User,
      label: "Thông tin tài khoản",
      href: "/user/profile",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Settings,
      label: "Cài đặt",
      href: "/user/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
  ];

  // Menu items for customer and staff - full features
  const customerMenuItems = [
    {
      icon: User,
      label: "Thông tin tài khoản",
      href: "/user/profile",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Heart,
      label: "Sản phẩm yêu thích",
      href: "/user/favorites",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: Package,
      label: "Đơn hàng của tôi",
      href: "/user/orders",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: CreditCard,
      label: "Phương thức thanh toán",
      href: "/user/payment-methods",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Settings,
      label: "Cài đặt",
      href: "/user/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
  ];

  // Choose menu based on user role
  const menuItems = user.role === 'admin' ? adminMenuItems : customerMenuItems;

  const handleMenuClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl hover:from-indigo-100 hover:to-purple-100 transition-all shadow-sm hover:shadow-md group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <motion.div 
          className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md"
          whileHover={{ rotate: 5 }}
        >
          <span className="text-white font-bold text-lg">
            {(user.fullName || user.email)?.charAt(0).toUpperCase()}
          </span>
        </motion.div>

        {/* User Info */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
            {user.fullName || user.email}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {user.role === "customer" ? "Khách hàng" : user.role}
          </span>
        </div>

        {/* Chevron Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl">
                    {(user.fullName || user.email)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{user.fullName || user.email}</p>
                  <p className="text-indigo-100 text-xs">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  onClick={() => handleMenuClick(item.href)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <div className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1 text-left">
                    {item.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2"></div>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors group"
              whileHover={{ x: 5 }}
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 group-hover:scale-110 transition-all">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600 flex-1 text-left">
                Đăng xuất
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
