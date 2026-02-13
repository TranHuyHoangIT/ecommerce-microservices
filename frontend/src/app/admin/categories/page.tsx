"use client";
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, CategoryFormData } from '@/services/api/admin';
import { useToast } from '@/contexts/ToastContext';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      showToast('Không thể tải danh mục', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast('Cập nhật danh mục thành công', 'success');
      } else {
        await createCategory(formData);
        showToast('Tạo danh mục thành công', 'success');
      }
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error) {
      showToast('Không thể lưu danh mục', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
      showToast('Xóa danh mục thành công', 'success');
      loadCategories();
    } catch (error) {
      showToast('Không thể xóa danh mục', 'error');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
    });
    setEditingCategory(null);
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
              <p className="text-gray-600 mt-1">Sắp xếp sản phẩm theo danh mục</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Thêm danh mục
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Tổng danh mục</p>
              <p className="text-4xl font-bold">{categories.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Có mô tả</p>
              <p className="text-4xl font-bold">{categories.filter(c => c.description).length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Có hình ảnh</p>
              <p className="text-4xl font-bold">{categories.filter(c => c.image).length}</p>
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">🏷️</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description || 'Chưa có mô tả'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.id)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                  </h2>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ví dụ: Điện tử, Thời trang, Thể thao"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mô tả ngắn cho danh mục..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                      <img src={formData.image} alt="Xem trước" className="mt-2 w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      {editingCategory ? 'Cập nhật' : 'Tạo danh mục'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
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
              setCategoryToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Xác nhận xóa danh mục"
            message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
            confirmText="Xóa"
            cancelText="Hủy"
            type="danger"
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
