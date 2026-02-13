// services/api/staff.ts
// API layer for staff operations
// E-Commerce Microservices Frontend

import api from "../api";
import { Product } from "../../types/products";
import { Order } from "./orders";

// ==================== QUẢN LÝ SẢN PHẨM ====================

export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
  images?: string[];
  brand?: string;
  sku?: string;
  specifications?: Record<string, string>;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  image?: string;
  images?: string[];
  brand?: string;
  sku?: string;
  specifications?: Record<string, string>;
}

export async function createProduct(productData: ProductCreate): Promise<Product> {
  const res = await api.post("/products", productData);
  return res.data;
}

export async function updateProduct(productId: string, productData: ProductUpdate): Promise<Product> {
  const res = await api.put(`/products/${productId}`, productData);
  return res.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/products/${productId}`);
}

export async function getAllProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.sort) queryParams.append("sort", params.sort);

  const res = await api.get(`/products?${queryParams.toString()}`);
  
  // If backend returns array directly, convert to expected format
  if (Array.isArray(res.data)) {
    return {
      products: res.data,
      total: res.data.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };
  }
  
  return res.data;
}

export async function updateProductStock(productId: string, stock: number): Promise<Product> {
  const res = await api.patch(`/products/${productId}/stock`, { stock });
  return res.data;
}

// ==================== QUẢN LÝ ĐỚN HÀNG ====================

export interface OrderFilter {
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAllOrders(filter?: OrderFilter): Promise<{
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}> {
  const queryParams = new URLSearchParams();
  if (filter?.status) queryParams.append("status", filter.status);
  if (filter?.start_date) queryParams.append("start_date", filter.start_date);
  if (filter?.end_date) queryParams.append("end_date", filter.end_date);
  if (filter?.search) queryParams.append("search", filter.search);
  if (filter?.page) queryParams.append("page", filter.page.toString());
  if (filter?.limit) queryParams.append("limit", filter.limit.toString());

  const res = await api.get(`/admin/orders?${queryParams.toString()}`);
  
  // If backend returns array directly, convert to expected format
  if (Array.isArray(res.data)) {
    return {
      orders: res.data,
      total: res.data.length,
      page: filter?.page || 1,
      limit: filter?.limit || 20,
    };
  }
  
  return res.data;
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled",
  note?: string
): Promise<Order> {
  const res = await api.put(`/orders/${orderId}/status`, { status, note });
  return res.data;
}

export async function addOrderNote(orderId: number, note: string): Promise<Order> {
  const res = await api.post(`/orders/${orderId}/notes`, { note });
  return res.data;
}

// ==================== THỐNG KÊ ====================

export interface StaffStats {
  total_products: number;
  low_stock_products: number;
  pending_orders: number;
  confirmed_orders: number;
  shipping_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue_today: number;
  total_revenue_month: number;
}

export async function getStaffStats(): Promise<StaffStats> {
  const defaultStats: StaffStats = {
    total_products: 0,
    low_stock_products: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    shipping_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    total_revenue_today: 0,
    total_revenue_month: 0,
  };

  try {
    // Get analytics data for order stats
    let analytics: any = {};
    try {
      const analyticsRes = await api.get("/analytics/stats");
      analytics = analyticsRes.data || {};
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
    
    // Get products data
    let totalProducts = 0;
    let lowStockProducts = 0;
    try {
      const productsRes = await api.get("/products?limit=1000");
      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.products || []);
      totalProducts = products.length;
      lowStockProducts = products.filter((p: any) => p.stock < 10).length;
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
    
    // Get orders data for monthly revenue
    let monthlyRevenue = 0;
    try {
      const ordersRes = await api.get("/admin/orders?limit=1000");
      const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || ordersRes.data || []);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      monthlyRevenue = allOrders
        .filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === currentMonth && 
                 orderDate.getFullYear() === currentYear &&
                 order.status !== 'cancelled';
        })
        .reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
    
    return {
      total_products: totalProducts,
      low_stock_products: lowStockProducts,
      pending_orders: analytics.pending || 0,
      confirmed_orders: analytics.confirmed || 0,
      shipping_orders: analytics.shipping || 0,
      delivered_orders: analytics.delivered || 0,
      cancelled_orders: analytics.cancelled || 0,
      total_revenue_today: 0,
      total_revenue_month: monthlyRevenue,
    };
  } catch (err) {
    console.error("Failed to fetch staff stats:", err);
    return defaultStats;
  }
}

export interface RecentActivity {
  id: string;
  type: "order" | "product" | "stock";
  message: string;
  timestamp: string;
}

export async function getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
  try {
    const res = await api.get(`/staff/activities?limit=${limit}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch recent activities:", err);
    return [];
  }
}

// ==================== DANH MỤC ====================

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}
