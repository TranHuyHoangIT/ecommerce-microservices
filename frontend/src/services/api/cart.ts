// cart.ts
// API layer for cart operations
// E-Commerce Microservices Frontend

import api from "../api";
import { CartItemType } from "../../types/cart";

export async function getCart(): Promise<CartItemType[]> {
  const res = await api.get(`/cart`);
  return res.data;
}

export async function addToCart(productId: string, quantity: number = 1, productData?: any): Promise<CartItemType> {
  const res = await api.post(`/cart`, { 
    product_id: productId, 
    quantity,
    price: productData?.price || 0,
    name: productData?.name || 'Product',
    image: productData?.image || '/placeholder.png'
  });
  return res.data;
}

export async function removeCartItem(id: string): Promise<void> {
  await api.delete(`/cart/${id}`);
}

export async function updateCartItemQuantity(id: string, quantity: number): Promise<void> {
  await api.put(`/cart/${id}`, { quantity });
}

export async function checkoutCart(): Promise<void> {
  await api.post(`/cart/checkout`);
}
