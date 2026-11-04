import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, AlertTriangle, ShieldCheck, XCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatDate } from '../../lib/utils';
import { getWhatsAppOrderUrl, ZENVO_WHATSAPP_RAW } from '../../lib/whatsapp';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ROUTES } from '../../constants/routes';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(() => (id ? orderService.getOrderById(id) : undefined));
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of mind');

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <Link
          to={ROUTES.ORDERS}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C47FF] text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  // Business Rule 7: Order cancel sirf "Placed" ya "Confirmed" status tak ho sakta hai
  const canCancel = order.status === 'placed' || order.status === 'confirmed';

  const handleConfirmCancel = () => {
    if (!user) return;
    try {
      const updated = orderService.cancelOrder(order.id, user.id, cancelReason);
      setOrder(updated);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel order.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ORDERS}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {order.order_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {formatDate(order.created_at)} · Payment via Cash on Delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <a
            href={getWhatsAppOrderUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send to WhatsApp ({ZENVO_WHATSAPP_RAW})</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {canCancel && (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">
          Order Tracking & Live Status
        </h2>
        <OrderStatusTimeline
          currentStatus={order.status}
          history={order.status_history}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display pb-2 border-b border-slate-100 dark:border-slate-800">
            Purchased Items ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=150&q=80'}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatPrice(item.price)} × {item.quantity} units
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatPrice(item.line_total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Coupon Discount ({order.coupon_code || 'Promo'})</span>
                <span className="tabular-nums">- {formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total COD Payable</span>
              <span className="text-[#6C47FF] tabular-nums font-bold">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white font-display">
            <MapPin className="w-4 h-4 text-[#6C47FF]" />
            <span>Shipping Destination</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">{order.shipping_address.full_name}</p>
            <p className="text-slate-500">{order.shipping_address.phone}</p>
            <p className="pt-1">{order.shipping_address.address_line1}</p>
            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.postal_code}
            </p>
          </div>

          {order.notes && (
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Delivery Notes:</span>{' '}
              {order.notes}
            </div>
          )}

          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
            <p className="font-bold">Payment Verified:</p>
            <p>Pay exact cash {formatPrice(order.total)} to courier rider upon delivery.</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Order Confirmation"
        description="Kya aap waqai is order ko cancel karna chahte hain? Cancelling will automatically restore product inventory."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};
