// types/products.ts
// Type definitions for products
// E-Commerce Microservices Frontend

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category?: string | { id: number; name: string; description?: string; created_at?: string; updated_at?: string };
  images?: string[];
  rating?: number;
  reviews_count?: number;
  brand?: string;
  sku?: string;
  specifications?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
