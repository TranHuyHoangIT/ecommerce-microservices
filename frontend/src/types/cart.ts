// cart.ts
// Type definitions for cart items
// E-Commerce Microservices Frontend

export interface CartItemType {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
