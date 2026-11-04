import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Ticket, Check, AlertCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { couponService } from '../../services/couponService';
import { formatPrice } from '../../lib/utils';
import { getWhatsAppQuickOrderUrl, ZENVO_WHATSAPP_RAW } from '../../lib/whatsapp';
import { CartItem } from '../../components/cart/CartItem';
import { EmptyState } from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    appliedCoupon,
    updateQty,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getTotal,
  } = useCartStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCodeInput.trim()) return;

    const res = couponService.validateCoupon(couponCodeInput.trim(), subtotal);
    if (!res.valid || !res.coupon) {
      setCouponError(res.message || 'Invalid coupon.');
    } else {
      applyCoupon(res.coupon);
      setCouponSuccess(res.message || 'Coupon applied successfully!');
      setCouponCodeInput('');
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
    } else {
      navigate(ROUTES.CHECKOUT);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Aapka Cart Khali Hai"
          description="Aapne abhi tak koi item cart mein add nahi kiya. Hamare popular products browse karein."
          actionText="Products Dekhein"
          actionLink={ROUTES.PRODUCTS}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cash on Delivery applicable on all items</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQty={updateQty}
              onRemove={removeItem}
            />
          ))}

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-1.5 text-[#6C47FF] hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Shopping Jari Rakhein</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Module */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Ticket className="w-4 h-4 text-[#6C47FF]" />
              <span>Have a Coupon Code?</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {appliedCoupon.discount_type === 'percentage'
                      ? `${appliedCoupon.discount_value}% Discount Applied`
                      : `₹${appliedCoupon.discount_value} Flat Off Applied`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="e.g. ZENVO10"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase placeholder:normal-case font-medium focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccess}</span>
                  </p>
                )}
              </form>
            )}

            <div className="text-[11px] text-slate-400">
              Try demo coupons: <code className="text-[#6C47FF] font-semibold">ZENVO10</code> or <code className="text-[#6C47FF] font-semibold">FLAT500</code>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">- {formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-emerald-600">FREE (COD)</span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-lg text-[#6C47FF] tabular-nums font-bold">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
              <span className="font-bold">Payment Method:</span> Cash on Delivery (COD). Pay cash directly to delivery partner upon inspection.
            </div>

            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-6 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Checkout Karein</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={getWhatsAppQuickOrderUrl({
                items,
                total,
                customerName: user?.full_name,
                customerPhone: user?.phone,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct WhatsApp Order ({ZENVO_WHATSAPP_RAW})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
