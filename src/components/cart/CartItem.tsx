import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

interface CartItemProps {
  item: CartItemType;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQty, onRemove }) => {
  const { product, quantity } = item;
  const maxAllowed = Math.min(product.stock, 10);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      {/* Product Image & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={ROUTES.PRODUCT_DETAIL(product.id)}
          className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700"
        >
          <img
            src={product.thumbnail_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80'}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="min-w-0">
          <Link
            to={ROUTES.PRODUCT_DETAIL(product.id)}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#6C47FF] truncate block max-w-xs"
          >
            {product.title}
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Sold by: <span className="text-slate-600 dark:text-slate-300">{product.seller_store_name || 'Vendor'}</span>
          </p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
            {formatPrice(product.price)} each
          </p>
        </div>
      </div>

      {/* Stepper + Total + Remove Action */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQty(product.id, quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            disabled={quantity >= maxAllowed}
            onClick={() => onUpdateQty(product.id, quantity + 1)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              quantity >= maxAllowed
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white dark:hover:bg-slate-700 cursor-pointer'
            }`}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[80px]">
          <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
            {formatPrice(product.price * quantity)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
