"use client";
// UI Component: Navbar
// Modern, responsive navigation bar for E-Commerce

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Heart, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import UserDropdown from './UserDropdown';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <motion.nav 
      className="w-full bg-white shadow-md fixed top-0 left-0 z-50 backdrop-blur-md bg-white/95"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href={getDashboardLink()}>
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              HoangTranShop
            </span>
          </motion.div>
        </Link>

        {/* Search Bar - Only for authenticated customers */}
        {isAuthenticated && user?.role === 'customer' && (
          <motion.form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xl mx-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-5 py-3 pl-12 pr-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </motion.form>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Navigation Links for customers */}
              {user.role === 'customer' && (
                <div className="flex items-center gap-2">
                  <Link href="/products">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span className="hidden sm:inline">Sản phẩm</span>
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="/user/favorites">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                        <Heart className="w-4 h-4" />
                        <span className="hidden sm:inline">Yêu thích</span>
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="/cart">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden sm:inline">Giỏ hàng</span>
                        {/* Badge for cart items count - có thể thêm sau */}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              )}

              {/* User Dropdown */}
              <UserDropdown />
            </>
          ) : (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" size="sm">Đăng nhập</Button>
                </motion.div>
              </Link>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm">Đăng ký</Button>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
