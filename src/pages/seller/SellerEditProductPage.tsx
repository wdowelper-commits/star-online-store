import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ImageUpload } from '../../components/common/ImageUpload';
import { ROUTES } from '../../constants/routes';

export const SellerEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categories = categoryService.getCategories();

  const product = id ? productService.getProductById(id) : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<string>('');
  const [comparePrice, setComparePrice] = useState<string>('');
  const [stock, setStock] = useState<string>('0');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategoryId(product.category_id || categories[0]?.id || '');
      setPrice(String(product.price));
      setComparePrice(product.compare_at_price ? String(product.compare_at_price) : '');
      setStock(String(product.stock));
      setLowStockThreshold(String(product.low_stock_threshold));
      setIsActive(product.is_active);
      const imgUrls = product.images?.map((img) => img.url) || [product.thumbnail_url || ''];
      setImages(imgUrls.filter(Boolean));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Product not found.</p>
        <Link to={ROUTES.SELLER_PRODUCTS} className="text-[#6C47FF] hover:underline text-xs mt-2 inline-block">
          Return to My Products
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock, 10);
    const numericThreshold = parseInt(lowStockThreshold, 10) || 5;

    if (!title.trim() || !description.trim()) {
      setError('Please provide a product title and description.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedCat = categories.find((c) => c.id === categoryId);

      productService.updateProduct(product.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId || null,
        category_name: selectedCat?.name,
        price: numericPrice,
        compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
        stock: numericStock,
        low_stock_threshold: numericThreshold,
        thumbnail_url: images[0] || product.thumbnail_url,
        is_active: isActive,
        images: images.map((url, i) => ({
          id: `img_${Date.now()}_${i}`,
          product_id: product.id,
          url,
          sort_order: i,
          created_at: new Date().toISOString(),
        })),
      });

      navigate(ROUTES.SELLER_PRODUCTS);
    } catch (err: any) {
      setError(err?.message || 'Failed to update product.');
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
            Edit Product
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Update details, stock levels, or images</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Category
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
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Compare Price (₹)
            </label>
            <input
              type="number"
              min="1"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>
        </div>

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
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Description
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
            Product Images
          </label>
          <ImageUpload images={images} onChange={setImages} maxImages={5} />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#6C47FF] rounded accent-[#6C47FF]"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active & visible in marketplace
            </span>
          </label>
        </div>

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
            <span>{isLoading ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
