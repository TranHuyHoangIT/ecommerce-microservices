// services/api/products.ts
// API layer for product operations
// E-Commerce Microservices Frontend

import api from "../api";
import { Product } from "../../types/products";

export type { Product };

export async function getProducts(): Promise<Product[]> {
  const res = await api.get(`/products`);
  return res.data;
}

export async function getProductById(id: string): Promise<Product> {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  try {
    const res = await api.get(`/products/${productId}/related?limit=4`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch related products:", err);
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    console.error("Failed to search products:", err);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const res = await api.get(`/products/category/${encodeURIComponent(category)}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch products by category:", err);
    return [];
  }
}

// Wishlist/Favorites API
export async function addToWishlist(userId: number, productId: number): Promise<any> {
  const res = await api.post(`/wishlist?user_id=${userId}`, { product_id: productId });
  return res.data;
}

export async function removeFromWishlist(userId: number, productId: number): Promise<void> {
  await api.delete(`/wishlist/${userId}/${productId}`);
}

export async function getUserWishlist(userId: number): Promise<Product[]> {
  const res = await api.get(`/wishlist/${userId}`);
  return res.data;
}

export async function isInWishlist(userId: number, productId: number): Promise<boolean> {
  try {
    const res = await api.get(`/wishlist/${userId}/check/${productId}`);
    return res.data.is_in_wishlist;
  } catch (err) {
    return false;
  }
}

