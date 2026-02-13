"use client";
import ProductCarousel from '@/features/home/components/ProductCarousel';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <ProductCarousel />
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700">Sản phẩm nổi bật</h2>
          <ProductGrid />
        </section>
      </div>
    </ProtectedRoute>
  );
}