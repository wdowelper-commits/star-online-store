import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { ImageUpload } from '../../components/common/ImageUpload';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [iconImages, setIconImages] = useState<string[]>([]);
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
    setIconImages([]);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(String(cat.sort_order));
    setIsFeatured(cat.is_featured);
    setIconImages(cat.icon_url ? [cat.icon_url] : []);
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
      const iconUrl = iconImages[0] || '';
      if (editingCategory) {
        categoryService.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          sort_order: parseInt(sortOrder, 10) || 0,
          is_featured: isFeatured,
          icon_url: iconUrl,
        });
      } else {
        categoryService.createCategory({
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          sort_order: parseInt(sortOrder, 10) || 0,
          is_featured: isFeatured,
          icon_url: iconUrl,
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
                <th className="py-3 px-4">Image / Icon</th>
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
                  <td className="py-3 px-4">
                    {cat.icon_url && (cat.icon_url.startsWith('http://') || cat.icon_url.startsWith('https://') || cat.icon_url.startsWith('data:image')) ? (
                      <img
                        src={cat.icon_url}
                        alt={cat.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center font-bold text-sm border border-purple-100 dark:border-purple-900/40 shrink-0">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs flex items-center gap-1.5 border border-red-200 dark:border-red-900/40 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Image / Icon Upload */}
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                <ImageUpload
                  images={iconImages}
                  onChange={setIconImages}
                  maxImages={1}
                  label="Category Image / Icon"
                  helperText="Device se tasveer upload karein ya direct image URL paste karein."
                />
              </div>

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
