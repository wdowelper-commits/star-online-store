import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlistStore();

  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.low_stock_threshold;
  const wishlisted = isWishlisted(product.id);

  // Discount percentage
  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.PRODUCTS)}`);
      return;
    }

    addItem(product, 1);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.PRODUCTS)}`);
      return;
    }

    toggle(user.id, product.id);
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Product Image + Badges */}
      <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.thumbnail_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Stock Badges */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center">
            <span className="px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider rounded-md">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[11px] font-semibold rounded-md shadow-xs">
            Sirf {product.stock} reh gaya!
          </span>
        ) : null}
      </Link>

      {/* Product Details Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category kicker & Seller tag */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
            <span className="font-semibold text-[#6C47FF] dark:text-purple-400 truncate max-w-[120px]">
              {product.category_name || 'Artisan Goods'}
            </span>
            {product.seller_store_name && (
              <span className="truncate max-w-[100px] text-slate-500 dark:text-slate-400">
                {product.seller_store_name}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={ROUTES.PRODUCT_DETAIL(product.id)}
            className="block text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#6C47FF] transition-colors leading-snug"
          >
            {product.title}
          </Link>
        </div>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(product.compare_at_price)}
                </span>
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {discountPercent}% off
                  </span>
                )}
              </>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isAddedFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-[#6C47FF] hover:bg-[#5535E8] text-white shadow-xs'
            }`}
          >
            {isOutOfStock ? (
              'Unavailable'
            ) : isAddedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
