import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { orderService } from '../../services/orderService';
import { db } from '../../lib/storage';
import { formatPrice } from '../../lib/utils';
import { getWhatsAppOrderUrl, ZENVO_WHATSAPP_RAW } from '../../lib/whatsapp';
import { Order } from '../../types';
import { ROUTES } from '../../constants/routes';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, appliedCoupon, getSubtotal, getDiscountAmount, getTotal, clearCart } =
    useCartStore();

  const savedAddresses = user ? db.getCustomerAddresses(user.id) : [];

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(savedAddresses[0]?.address_line1 || '');
  const [addressLine2, setAddressLine2] = useState(savedAddresses[0]?.address_line2 || '');
  const [city, setCity] = useState(savedAddresses[0]?.city || 'Lahore');
  const [state, setState] = useState(savedAddresses[0]?.state || 'Punjab');
  const [postalCode, setPostalCode] = useState(savedAddresses[0]?.postal_code || '54000');
  const [notes, setNotes] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getTotal();

  React.useEffect(() => {
    if (items.length === 0 && !isSubmitting && !placedOrder) {
      navigate(ROUTES.CART);
    }
  }, [items.length, isSubmitting, placedOrder, navigate]);

  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
              Order Placed · Cash on Delivery
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Shukriya! Order Confirmed.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your order <span className="font-bold text-slate-800 dark:text-slate-200">{placedOrder.order_number}</span> has been received. You can now send order details directly to our official WhatsApp helpline.
            </p>
          </div>

          {/* WhatsApp Direct Action Box */}
          <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                WhatsApp Helpline: {ZENVO_WHATSAPP_RAW}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                Active 24/7
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300">
              Click below to send complete order bill, items, and address directly to WhatsApp <strong>03027628552</strong> for priority dispatch.
            </p>

            <a
              href={getWhatsAppOrderUrl(placedOrder)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Order to WhatsApp (03027628552)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ORDER_DETAIL(placedOrder.id))}
              className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Track Order Online
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.HOME)}
              className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return null;
  }

  const handleSelectSavedAddress = (addrId: string) => {
    const found = savedAddresses.find((a) => a.id === addrId);
    if (found) {
      setFullName(found.full_name);
      setPhone(found.phone);
      setAddressLine1(found.address_line1);
      setAddressLine2(found.address_line2 || '');
      setCity(found.city);
      setState(found.state);
      setPostalCode(found.postal_code);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim()) {
      setError('Please fill in all required shipping address fields marked with *');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save address if requested
      if (saveAsDefault) {
        db.createAddress({
          id: `addr_${Date.now()}`,
          customer_id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          is_default: true,
          created_at: new Date().toISOString(),
        });
      }

      // Place order in DB
      const order = orderService.placeOrder({
        customerId: user.id,
        customerName: fullName.trim(),
        customerEmail: user.email,
        shippingAddress: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
        },
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        couponId: appliedCoupon?.id,
        couponCode: appliedCoupon?.code,
        discountAmount: discount,
        notes: notes.trim() || undefined,
      });

      // Clear shopping bag
      clearCart();

      // Show WhatsApp confirmation modal
      setPlacedOrder(order);
    } catch (err: any) {
      setError(err?.message || 'Failed to place order. Please check stock availability and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <Link
          to={ROUTES.CART}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Checkout — Cash on Delivery (COD)
          </h1>
          <p className="text-xs text-slate-500">Fast doorstep shipping across Pakistan</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping Form (8 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              1. Delivery & Shipping Address
            </h2>

            {savedAddresses.length > 0 && (
              <select
                onChange={(e) => handleSelectSavedAddress(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="">Use a saved address...</option>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.city})
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium border border-red-200 dark:border-red-900/40">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Bilal Khan"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (Courier Contact) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Complete Street Address / House / Flat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House #, Street #, Sector / Area"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address Line 2 / Landmark (Optional)
            </label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Near landmark or apartment name"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lahore / Karachi"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Province / State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Punjab"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="54000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Order Delivery Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please call before arriving or leave with gatekeeper"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="w-4 h-4 text-[#6C47FF] rounded accent-[#6C47FF]"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Save this address for future 1-click orders
            </span>
          </label>
        </div>

        {/* Order Review & COD Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              2. Items in Order ({items.length})
            </h2>

            {/* Micro items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.thumbnail_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{item.product.title}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold tabular-nums shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment Method Badge */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Method: Cash on Delivery (COD)</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Pay in cash when order is delivered directly to your doorstep.
              </p>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-base font-extrabold text-slate-900 dark:text-white">
                <span>Total Amount Due on Delivery</span>
                <span className="text-[#6C47FF] tabular-nums font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                'Placing Your Order...'
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Order Place Karein ({formatPrice(total)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
