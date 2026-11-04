import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ImageUpload } from '../../components/common/ImageUpload';
import { ROUTES } from '../../constants/routes';

export const SellerAddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, sellerProfile } = useAuthStore();
  const categories = categoryService.getCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState<string>('');
  const [comparePrice, setComparePrice] = useState<string>('');
  const [stock, setStock] = useState<string>('10');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock, 10);
    const numericThreshold = parseInt(lowStockThreshold, 10) || 5;

    if (!title.trim() || !description.trim()) {
      setError('Please provide a product title and detailed description.');
      return;
    }
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please provide a valid selling price.');
      return;
    }
    if (isNaN(numericStock) || numericStock < 0) {
      setError('Please provide a valid stock quantity.');
      return;
    }
    if (images.length === 0) {
      setError('Meharbani karke kam az kam 1 product image upload karein ya image URL add karein.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

      productService.createProduct({
        seller_id: user.id,
        category_id: categoryId || null,
        title: title.trim(),
        slug,
        description: description.trim(),
        price: numericPrice,
        compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
        stock: numericStock,
        low_stock_threshold: numericThreshold,
        thumbnail_url: images[0] || '',
        is_active: isActive,
        is_approved: true, // Auto-approved in demo/direct marketplace setting
        is_deleted: false,
        is_featured: false,
        seller_name: user.full_name,
        seller_store_name: sellerProfile?.store_name || user.full_name,
        category_name: selectedCat?.name,
        images: images.map((url, i) => ({
          id: `img_${Date.now()}_${i}`,
          product_id: '',
          url,
          sort_order: i,
          created_at: new Date().toISOString(),
        })),
      });

      navigate(ROUTES.SELLER_PRODUCTS);
    } catch (err: any) {
      setError(err?.message || 'Failed to add product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <Link
          to={ROUTES.SELLER_PRODUCTS}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Add New Product
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            List a new product in your verified vendor catalog
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Handcrafted Vegetable-Tanned Leather Briefcase"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
          />
        </div>

        {/* Category & Price Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Selling Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2999"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Compare-at Price (₹)
            </label>
            <input
              type="number"
              min="1"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              placeholder="e.g. 4500 (Optional strike-through)"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>
        </div>

        {/* Stock & Low Stock Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Units in warehouse"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              required
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              placeholder="Default is 5"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Product Description & Craftsmanship Details <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe materials, sizing, dimensions, craftsmanship, and specifications..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
          />
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
            Product Images
          </label>
          <ImageUpload images={images} onChange={setImages} maxImages={5} />
        </div>

        {/* Is Active Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#6C47FF] rounded accent-[#6C47FF]"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Make product immediately visible in marketplace
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={ROUTES.SELLER_PRODUCTS}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving Product...' : 'Publish Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
