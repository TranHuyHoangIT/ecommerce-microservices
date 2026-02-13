"use client";
import { useEffect, useState, Suspense } from 'react';
import StaffLayout from '@/components/StaffLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import StockBadge from '@/components/StockBadge';
import { getAllProducts } from '@/services/api/staff';
import { Product } from '@/types/products';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function StaffProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'low-stock') {
      setStockFilter('low-stock');
    }
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      (typeof product.category === 'string' ? product.category === categoryFilter : product.category?.name === categoryFilter);
    
    let matchesStock = true;
    if (stockFilter === 'low-stock') {
      matchesStock = product.stock > 0 && product.stock < 10;
    } else if (stockFilter === 'out-of-stock') {
      matchesStock = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = Array.from(new Set(products.map(p => 
    typeof p.category === 'string' ? p.category : p.category?.name || ''
  ).filter(Boolean)));

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý danh mục sản phẩm trong hệ thống</p>
          </div>
          <Link
            href="/staff/products/new"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:transform hover:scale-105"
          >
            <span className="text-xl mr-2">+</span>
            Thêm sản phẩm mới
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên sản phẩm..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="low-stock">Sắp hết hàng</option>
                <option value="out-of-stock">Hết hàng</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Tìm thấy <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
            </p>
            {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStockFilter('all');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <p className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</p>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Sản phẩm</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Danh mục</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Giá</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Tồn kho</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {typeof product.category === 'string' ? product.category : product.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-700">{product.stock}</span>
                      </td>
                      <td className="py-4 px-6">
                        <StockBadge stock={product.stock} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/staff/products/${product.id}`}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            Sửa
                          </Link>
                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            Xem
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}

export default function StaffProductsPage() {
  return (
    <Suspense fallback={<StaffLayout><div className="flex items-center justify-center h-96"><LoadingSpinner size="large" /></div></StaffLayout>}>
      <StaffProductsContent />
    </Suspense>
  );
}
