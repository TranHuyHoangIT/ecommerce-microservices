// auth.ts
// API layer for authentication operations
// E-Commerce Microservices Frontend

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  full_name: string;
  role: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', data.email);
  formData.append('password', data.password);
  
  const res = await axios.post(`${API_URL}/auth/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res.data;
}

export async function register(data: RegisterRequest): Promise<{ id: number; email: string; full_name: string }> {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
}

export async function logout(): Promise<void> {
  await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
}
