"use client";
import { ProductGrid } from '@/features/products/components/ProductGrid';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <ProductGrid />
    </ProtectedRoute>
  );
}