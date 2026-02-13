// services/api/orders.ts
// API layer for order operations
// E-Commerce Microservices Frontend

import api from "../api";

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderCreate {
  user_id: number;
  user_name?: string;
  user_email?: string;
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
}

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

export async function createOrder(orderData: OrderCreate): Promise<Order> {
  const res = await api.post("/orders", orderData);
  return res.data;
}

export async function getOrderById(orderId: number): Promise<Order> {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const res = await api.get(`/orders/user/${userId}`);
  return res.data;
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
  const res = await api.put(`/orders/${orderId}`, { status });
  return res.data;
}
