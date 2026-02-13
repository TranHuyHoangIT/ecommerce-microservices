// page.tsx
// Cart Page route for Next.js App Router
// E-Commerce Microservices Frontend

"use client";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";

const CartPage = dynamic(() => import("@/features/cart/CartPage"), { ssr: false });

export default function CartRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <CartPage />
    </ProtectedRoute>
  );
}
