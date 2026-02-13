"use client";
// useCart.ts
// Custom hook for cart state management
// E-Commerce Microservices Frontend

import { useState, useEffect } from "react";
import { CartItemType } from "../types/cart";
import { getCart, addToCart as addToCartAPI, removeCartItem, updateCartItemQuantity, checkoutCart } from "../services/api/cart";

export function useCart() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadCart = () => {
    setLoading(true);
    getCart()
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải giỏ hàng.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1, productData?: any) => {
    try {
      const newItem = await addToCartAPI(productId, quantity, productData);
      setCart((prev) => {
        const existingItem = prev.find(item => item.product_id === productId);
        if (existingItem) {
          return prev.map(item => 
            item.product_id === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, newItem];
      });
      return true;
    } catch (err) {
      setError("Lỗi khi thêm sản phẩm vào giỏ hàng.");
      return false;
    }
  };

  const removeItem = (id: string) => {
    removeCartItem(id)
      .then(() => setCart((prev) => prev.filter((item) => item.id !== id)))
      .catch(() => setError("Lỗi khi xóa sản phẩm."));
  };

  const updateQuantity = (id: string, quantity: number) => {
    updateCartItemQuantity(id, quantity)
      .then(() => setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity } : item)))
      .catch(() => setError("Lỗi khi cập nhật số lượng."));
  };

  const checkout = () => {
    checkoutCart()
      .then(() => setCart([]))
      .catch(() => setError("Lỗi khi thanh toán."));
  };

  return { cart, loading, error, addToCart, removeItem, updateQuantity, checkout, refreshCart: loadCart };
}
