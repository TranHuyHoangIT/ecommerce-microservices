// services/api/admin.ts
// Admin API layer for managing products, orders, and users
// E-Commerce Microservices Frontend

import api from "../api";

// ============= Product Management =============
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  image?: string;
  images?: string[];
  sku?: string;
  specifications?: Record<string, any>;
}

export async function getAllProducts() {
  const res = await api.get("/products");
  return res.data;
}

export async function createProduct(productData: ProductFormData) {
  const res = await api.post("/admin/products", productData);
  return res.data;
}

export async function updateProduct(productId: number, productData: Partial<ProductFormData>) {
  const res = await api.put(`/admin/products/${productId}`, productData);
  return res.data;
}

export async function deleteProduct(productId: number) {
  const res = await api.delete(`/admin/products/${productId}`);
  return res.data;
}

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/admin/products/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateProductStock(productId: number, stock: number) {
  const res = await api.put(`/admin/products/${productId}/stock?stock=${stock}`);
  return res.data;
}

export async function getProductStats() {
  const res = await api.get("/admin/products/stats");
  return res.data;
}

// ============= Category Management =============
export interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
}

export async function getAllCategories() {
  const res = await api.get("/categories");
  return res.data;
}

export async function createCategory(categoryData: CategoryFormData) {
  const res = await api.post("/admin/categories", categoryData);
  return res.data;
}

export async function updateCategory(categoryId: number, categoryData: Partial<CategoryFormData>) {
  const res = await api.put(`/admin/categories/${categoryId}`, categoryData);
  return res.data;
}

export async function deleteCategory(categoryId: number) {
  const res = await api.delete(`/admin/categories/${categoryId}`);
  return res.data;
}

// ============= Order Management =============
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

export async function getAllOrders(skip = 0, limit = 100, status?: string) {
  let url = `/admin/orders?skip=${skip}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  const res = await api.get(url);
  return res.data;
}

export async function updateOrderStatus(orderId: number, status: string, note?: string) {
  const res = await api.put(`/admin/orders/${orderId}/status`, { status, note });
  return res.data;
}

export async function cancelOrder(orderId: number, reason?: string) {
  const res = await api.post(`/admin/orders/${orderId}/cancel`, { reason });
  return res.data;
}

export async function refundOrder(orderId: number, amount?: number) {
  const res = await api.post(`/admin/orders/${orderId}/refund`, { amount });
  return res.data;
}

export async function getOrderStats() {
  const res = await api.get("/admin/orders/stats");
  return res.data;
}

// ============= User Management =============
export interface User {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  role: "admin" | "staff" | "customer";
  is_active: boolean;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  phone?: string;
  role: "customer" | "staff";
}

export interface CreateUserResponse {
  user: User;
  temp_password: string;
  email_sent: boolean;
  message: string;
}

export async function getAllUsers(skip = 0, limit = 100) {
  const res = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
  return res.data;
}

export async function createUser(userData: CreateUserData): Promise<CreateUserResponse> {
  const res = await api.post("/admin/users", userData);
  return res.data;
}

export async function updateUser(userId: number, userData: Partial<CreateUserData>) {
  const res = await api.put(`/admin/users/${userId}`, userData);
  return res.data;
}

export async function deleteUser(userId: number) {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
}

export async function updateUserRole(userId: number, role: string) {
  const res = await api.put(`/admin/users/${userId}/role`, { role });
  return res.data;
}

export async function updateUserStatus(userId: number, isActive: boolean) {
  const res = await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
  return res.data;
}

// ============= Analytics =============
export async function getDashboardStats() {
  const res = await api.get("/analytics/stats");
  return res.data;
}

export async function getRevenueData(period = "daily", days = 30) {
  const res = await api.get(`/analytics/revenue?period=${period}&days=${days}`);
  return res.data;
}

export async function getTopProducts(limit = 10) {
  const res = await api.get(`/analytics/top-products?limit=${limit}`);
  return res.data;
}

export async function getOrdersByStatus() {
  const res = await api.get("/analytics/orders-by-status");
  return res.data;
}
