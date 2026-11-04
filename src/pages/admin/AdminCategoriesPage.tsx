import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = () => {
    setCategories(categoryService.getCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setSortOrder('0');
    setIsFeatured(false);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(String(cat.sort_order));
    setIsFeatured(cat.is_featured);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    try {
      if (editingCategory) {
        categoryService.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          sort_order: parseInt(sortOrder, 10) || 0,
          is_featured: isFeatured,
        });
      } else {
        categoryService.createCategory({
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          sort_order: parseInt(sortOrder, 10) || 0,
          is_featured: isFeatured,
        });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      setError(err?.message || 'Failed to save category.');
    }
  };

  const handleDelete = (catId: string) => {
    try {
      categoryService.deleteCategory(catId);
      loadCategories();
    } catch (err: any) {
      alert(err?.message || 'Cannot delete category with products.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize catalog taxonomies and featured homepage collections
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-semibold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug Identifier</th>
                <th className="py-3 px-4">Homepage Featured</th>
                <th className="py-3 px-4">Sort Priority</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cat.slug}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cat.is_featured
                          ? 'bg-purple-50 text-[#6C47FF]'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {cat.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-slate-600 dark:text-slate-400">
                    {cat.sort_order}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-[#6C47FF] rounded-lg cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Footwear & Shoes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. footwear-shoes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sort Priority (Lower numbers appear first)
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#6C47FF] rounded accent-[#6C47FF]"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Feature in Homepage navigation bar
                </span>
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C47FF] text-white rounded-xl font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
