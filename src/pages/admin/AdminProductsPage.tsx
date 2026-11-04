import React, { useState, useEffect } from 'react';
import { Package, Trash2, Check, X, ShieldAlert, CheckCircle, ExternalLink, Plus, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ImageUpload } from '../../components/common/ImageUpload';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('15');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = categoryService.getCategories();

  const loadAllProducts = () => {
    setProducts(productService.getAllProductsAdmin());
  };

  useEffect(() => {
    loadAllProducts();
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const handleToggleApproval = (productId: string, current: boolean) => {
    productService.approveProduct(productId, !current);
    loadAllProducts();
  };

  const handleToggleActive = (productId: string) => {
    productService.toggleActive(productId);
    loadAllProducts();
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      productService.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      loadAllProducts();
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock, 10);

    if (!title.trim() || !description.trim()) {
      setError('Please provide title and description.');
      return;
    }
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (isNaN(numericStock) || numericStock < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }
    if (images.length === 0) {
      setError('Meharbani karke kam az kam 1 product image upload karein ya image URL add karein.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

      productService.createProduct({
        seller_id: 'user_admin_001',
        category_id: categoryId || null,
        title: title.trim(),
        slug,
        description: description.trim(),
        price: numericPrice,
        compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
        stock: numericStock,
        low_stock_threshold: 5,
        thumbnail_url: images[0] || '',
        is_active: true,
        is_approved: true,
        is_deleted: false,
        is_featured: false,
        seller_name: 'Zenvo Official Vendor',
        seller_store_name: 'Zenvo Curated Marketplace',
        category_name: selectedCat?.name,
        images: images.map((url, i) => ({
          id: `img_${Date.now()}_${i}`,
          product_id: '',
          url,
          sort_order: i,
          created_at: new Date().toISOString(),
        })),
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setComparePrice('');
      setStock('15');
      setImages([]);
      setIsAddModalOpen(false);
      loadAllProducts();
    } catch (err: any) {
      setError(err?.message || 'Failed to add product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCatFilter === 'all') return true;
    return p.category_id === selectedCatFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Platform Product Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, approve, suspend or add products across all categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setError('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4">Admin Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{p.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {p.seller_store_name || p.seller_name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {p.category_name || 'General'}
                  </td>
                  <td className="py-3 px-4 font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatPrice(p.price)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${p.stock <= p.low_stock_threshold ? 'text-red-500 font-bold' : ''}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                        p.is_active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleApproval(p.id, p.is_approved)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                        p.is_approved
                          ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {p.is_approved ? <Check className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      <span>{p.is_approved ? 'Approved' : 'Pending'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={ROUTES.PRODUCT_DETAIL(p.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Remove Product"
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Add New Product / Naya Product Add Karein
                </h3>
                <p className="text-xs text-slate-500">
                  Upload product images from device or paste image URLs
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200 dark:border-red-900/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-5">
              {/* Image Upload Component */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={6}
                  label="Product Photos (Device Upload ya URL)"
                  helperText="Apne computer ya mobile se photos upload karein."
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Artisanal Hand-Stitched Leather Messenger Bag"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                />
              </div>

              {/* Category, Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail information about material, dimensions, warranty..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!productToDelete}
        title="Admin Delete Product"
        description={`Remove "${productToDelete?.title}" from platform listing?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setProductToDelete(null)}
      />
    </div>
  );
};
