import React, { useEffect } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../lib/utils';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export const WishlistPage: React.FC = () => {
  const { user } = useAuthStore();
  const { items, loadWishlist, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (user) {
      loadWishlist(user.id);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Wishlist Khali Hai"
          description="Aapne abhi tak koi product save nahi kiya. Apne pasandida items wishlist mein save karein."
          actionText="Products Browse Karein"
          actionLink={ROUTES.PRODUCTS}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          My Saved Items ({items.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review saved products and move to cart anytime</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((wishItem) => {
          const product = wishItem.product;
          if (!product) return null;

          return (
            <div
              key={wishItem.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className="block aspect-square relative overflow-hidden bg-slate-100">
                  <img
                    src={product.thumbnail_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {product.stock <= 0 && (
                    <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </Link>

                <div className="p-4 space-y-2">
                  <span className="text-[11px] font-bold text-[#6C47FF] uppercase">
                    {product.category_name || 'Marketplace'}
                  </span>
                  <Link
                    to={ROUTES.PRODUCT_DETAIL(product.id)}
                    className="block text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-[#6C47FF]"
                  >
                    {product.title}
                  </Link>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => {
                    addItem(product, 1);
                    if (user) toggle(user.id, product.id);
                  }}
                  className="flex-1 py-2 px-3 bg-[#6C47FF] hover:bg-[#5535E8] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart Mein Daalein</span>
                </button>
                <button
                  type="button"
                  onClick={() => user && toggle(user.id, product.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
