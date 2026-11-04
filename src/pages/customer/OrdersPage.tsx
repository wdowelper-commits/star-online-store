import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';

export const OrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      setOrders(orderService.getCustomerOrders(user.id));
    }
  }, [user]);

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="Koi Order Nahi Mila"
          description="Aapne abhi tak koi order place nahi kiya. Hamare exclusive marketplace items browse karein."
          actionText="Shopping Shuru Karein"
          actionLink={ROUTES.PRODUCTS}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track and review all your purchases</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const firstItem = order.items?.[0];
          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700">
                  <img
                    src={firstItem?.thumbnail || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-display">
                      {order.order_number}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ordered on: {formatDate(order.created_at)}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'} ·{' '}
                    <strong className="text-slate-900 dark:text-white">{formatPrice(order.total)}</strong> (COD)
                  </p>
                </div>
              </div>

              <Link
                to={ROUTES.ORDER_DETAIL(order.id)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-[#6C47FF] text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-[#6C47FF] rounded-xl text-xs font-semibold transition-all shrink-0"
              >
                <span>Detail Dekhein</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
