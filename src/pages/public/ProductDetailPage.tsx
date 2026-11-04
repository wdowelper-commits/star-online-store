import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Store,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { ProductImageGallery } from '../../components/products/ProductImageGallery';
import { ProductCard } from '../../components/products/ProductCard';
import { ROUTES } from '../../constants/routes';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const product = id ? productService.getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are looking for may have been removed or does not exist.</p>
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C47FF] text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse All Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.low_stock_threshold;
  const wishlisted = isWishlisted(product.id);
  const maxAllowedQty = Math.min(product.stock, 10);

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  // Related products
  const { products: allCategoryProds } = productService.getProducts({
    category: product.category_id || undefined,
    approvedOnly: true,
    activeOnly: true,
  });
  const relatedProducts = allCategoryProds.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.PRODUCT_DETAIL(product.id))}`);
      return;
    }

    addItem(product, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.PRODUCT_DETAIL(product.id))}`);
      return;
    }
    toggle(user.id, product.id);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to={ROUTES.HOME} className="hover:text-[#6C47FF]">Home</Link>
        <span>/</span>
        <Link to={ROUTES.PRODUCTS} className="hover:text-[#6C47FF]">Products</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main PDP Grid: Gallery on Left, Purchase Module on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <ProductImageGallery
            images={product.images || [{ id: '1', url: product.thumbnail_url || '', sort_order: 0 }]}
            title={product.title}
          />
        </div>

        {/* Purchase Module */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Header & Seller Tag */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-[#6C47FF] uppercase tracking-wide">
                {product.category_name || 'Marketplace Item'}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1 text-slate-500 hover:text-[#6C47FF] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug font-display">
              {product.title}
            </h1>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  {discountPercent && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      Save {discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Includes all local taxes. Cash on Delivery (COD) available.</p>
          </div>

          {/* Stock Alert Badge */}
          <div>
            {isOutOfStock ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Currently Out of Stock. Vendor will replenish soon.</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Only {product.stock} units remaining in stock. Order now!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>In Stock ({product.stock} units available)</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                    disabled={quantity >= maxAllowedQty}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Subtotal: <strong className="text-slate-800 dark:text-slate-200">{formatPrice(product.price * quantity)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Add to Cart & Wishlist */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isOutOfStock
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : isAddedToast
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#6C47FF] hover:bg-[#5535E8] text-white'
              }`}
            >
              {isOutOfStock ? (
                'Out of Stock'
              ) : isAddedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Cart Mein Add Ho Gaya!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart Mein Daalein</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                wishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Seller Card */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {product.seller_store_name || product.seller_name || 'Independent Artisan'}
              </p>
              <p className="text-[11px] text-slate-400">Verified Marketplace Vendor · High Customer Rating</p>
            </div>
          </div>

          {/* Delivery & Assurance */}
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6C47FF]" />
              <span>Standard Delivery in 2–4 business days via verified courier</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cash on Delivery (COD) · Inspect before paying</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>7-day return guarantee if defective or mismatched</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
          Product Description & Craftsmanship Details
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Related Products You Might Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
