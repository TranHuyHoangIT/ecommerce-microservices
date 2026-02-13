"use client";
// useUserProfile.ts
// Custom hook for user profile state management
// E-Commerce Microservices Frontend

import { useState, useEffect } from "react";
import { UserProfileType } from "../types/user";
import { getUserProfile, logoutUser } from "../services/api/user";

export function useUserProfile() {
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getUserProfile()
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải thông tin tài khoản.");
        setLoading(false);
      });
  }, []);

  const logout = () => {
    logoutUser()
      .then(() => setUser(null))
      .catch(() => setError("Lỗi khi đăng xuất."));
  };

  return { user, loading, error, logout };
}
