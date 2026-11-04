import React, { useState, useEffect } from 'react';
import { Package, Eye, CheckCircle, Truck, X, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const SellerOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(null);

  const loadOrders = () => {
    if (user) {
      setOrders(orderService.getSellerOrders(user.id));
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  if (!user) return null;

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus, note: string) => {
    orderService.updateOrderStatus(orderId, nextStatus, note, user.id);
    loadOrders();
    if (activeModalOrder && activeModalOrder.id === orderId) {
      setActiveModalOrder(orderService.getOrderById(orderId) || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Customer Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and fulfill customer purchases for your listed products
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedStatusFilter === status
                  ? 'bg-[#6C47FF] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Koi Order Nahi Mila"
          description={`No orders found in "${selectedStatusFilter}" status.`}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Seller Items</th>
                  <th className="py-3 px-4 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => {
                  const sellerItems = ord.items?.filter((i) => i.seller_id === user.id) || [];
                  const sellerTotal = sellerItems.reduce((acc, curr) => acc + curr.line_total, 0);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(ord.created_at)}</td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {ord.customer_name || 'Customer'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{ord.shipping_address.city}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatPrice(sellerTotal)}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">({sellerItems.length} items)</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Status Transition buttons as per PRD: Placed -> Confirmed, Confirmed -> Shipped */}
                        {ord.status === 'placed' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(ord.id, 'confirmed', 'Order confirmed by seller')
                            }
                            className="px-2.5 py-1 bg-purple-50 text-[#6C47FF] hover:bg-[#6C47FF] hover:text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Confirm Order
                          </button>
                        )}

                        {ord.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(ord.id, 'shipped', 'Package dispatched via courier')
                            }
                            className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Mark Shipped
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveModalOrder(ord)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg inline-flex items-center"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seller Order Detail Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                {activeModalOrder.order_number}
              </h3>
              <StatusBadge status={activeModalOrder.status} />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">Customer & Shipping Address:</p>
              <p className="font-semibold text-slate-900 dark:text-white">{activeModalOrder.shipping_address.full_name}</p>
              <p className="text-slate-500">Phone: {activeModalOrder.shipping_address.phone}</p>
              <p>{activeModalOrder.shipping_address.address_line1}, {activeModalOrder.shipping_address.city}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Your Products in this Order:
              </p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs space-y-2">
                {activeModalOrder.items
                  ?.filter((i) => i.seller_id === user.id)
                  .map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={item.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold">{formatPrice(item.line_total)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setActiveModalOrder(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
