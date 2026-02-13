// user.ts
// API layer for user profile operations
// E-Commerce Microservices Frontend

import api from "../api";
import { UserProfileType } from "../../types/user";

export interface UserUpdate {
  full_name?: string;
  phone?: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

export async function getUserProfile(): Promise<UserProfileType> {
  const res = await api.get(`/users/me`);
  return res.data;
}

export async function updateProfile(userData: UserUpdate): Promise<UserProfileType> {
  const res = await api.put("/users/me", userData);
  return res.data;
}

export async function changePassword(passwordData: ChangePassword): Promise<UserProfileType> {
  const res = await api.post("/users/me/change-password", passwordData);
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await api.post(`/auth/logout`);
}

