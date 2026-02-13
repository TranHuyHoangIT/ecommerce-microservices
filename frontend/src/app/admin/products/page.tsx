"use client";
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, ProductFormData, getAllCategories } from '@/services/api/admin';
import { useToast } from '@/contexts/ToastContext';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  image?: string;
  rating?: number;
  reviews_count?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: '',
    image: '',
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      showToast('Không thể tải danh mục', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast('Cập nhật sản phẩm thành công', 'success');
      } else {
        await createProduct(formData);
        showToast('Tạo sản phẩm thành công', 'success');
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      showToast('Không thể lưu sản phẩm', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: typeof product.category === 'object' ? product.category?.name || '' : product.category || '',
      brand: product.brand || '',
      image: product.image || '',
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      showToast('Xóa sản phẩm thành công', 'success');
      loadProducts();
    } catch (error) {
      showToast('Không thể xóa sản phẩm', 'error');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await uploadProductImage(file);
      setFormData({ ...formData, image: result.image_url });
      showToast('Tải ảnh lên thành công', 'success');
    } catch (error) {
      showToast('Không thể tải ảnh lên', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      brand: '',
      image: '',
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
    const matchesCategory = filterCategory === 'all' || categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
              <p className="text-gray-600 mt-1">Quản lý kho hàng và sản phẩm</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Thêm sản phẩm
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hình ảnh</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Giá</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tồn kho</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Đánh giá</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm whitespace-nowrap">
                            {typeof product.category === 'object' ? product.category?.name : product.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">${product.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock > 20 ? 'bg-green-100 text-green-700' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-medium">{product.rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-gray-400 text-sm">({product.reviews_count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="w-20 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            className="w-20 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {editingProduct ? 'Cập nhật thông tin sản phẩm của bạn' : 'Điền thông tin sản phẩm mới'}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowModal(false); resetForm(); }} 
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto" style={{maxHeight: 'calc(90vh - 180px)'}}>
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ví dụ: Giày thể thao Nike Air Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Mô tả chi tiết về sản phẩm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Price & Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá bán <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0"
                          step="1000"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">VNĐ</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tồn kho <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category & Brand */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                      </label>
                      {loadingCategories ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                          Đang tải...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="space-y-2">
                          <div className="w-full px-3 py-2 border border-yellow-400 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                            Chưa có danh mục
                          </div>
                          <Link 
                            href="/admin/categories"
                            className="block w-full px-3 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Tạo danh mục mới
                          </Link>
                        </div>
                      ) : (
                        <>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">Chọn danh mục</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <Link 
                            href="/admin/categories"
                            className="inline-block mt-1.5 text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Quản lý danh mục
                          </Link>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thương hiệu
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Ví dụ: Nike, Adidas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Product Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh sản phẩm
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:text-sm file:font-medium"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">JPG, PNG, GIF - Tối đa 5MB</p>
                      </div>
                      {formData.image && (
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      {editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => {
              setShowConfirmDialog(false);
              setProductToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Xác nhận xóa sản phẩm"
            message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
            confirmText="Xóa"
            cancelText="Hủy"
            type="danger"
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
