import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, X, MapPin, Search, MessageSquare, ExternalLink } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';
import { getWhatsAppOrderUrl, ZENVO_WHATSAPP_RAW } from '../../lib/whatsapp';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(null);

  const loadOrders = () => {
    setOrders(orderService.getAllOrdersAdmin());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orderService.updateOrderStatus(
      orderId,
      newStatus,
      `Status updated to ${newStatus} by platform administrator`,
      'admin'
    );
    loadOrders();
    if (activeModalOrder?.id === orderId) {
      setActiveModalOrder(updated);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Platform Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit COD orders, courier dispatches, and fulfillment timelines
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer..."
            className="pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-64 focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors ${
              selectedStatus === status
                ? 'bg-[#6C47FF] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total (COD)</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Update Pipeline</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(ord.created_at)}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{ord.customer_name}</p>
                    <p className="text-[10px] text-slate-400">{ord.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={getWhatsAppOrderUrl(ord)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
                        title={`Open Order on WhatsApp (${ZENVO_WHATSAPP_RAW})`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveModalOrder(ord)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg cursor-pointer"
                        title="Inspect full details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Details Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                  {activeModalOrder.order_number}
                </h3>
                <p className="text-xs text-slate-400">{formatDate(activeModalOrder.created_at)}</p>
              </div>
              <StatusBadge status={activeModalOrder.status} />
            </div>

            {/* Timeline */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Order Status History
              </h4>
              <OrderStatusTimeline
                currentStatus={activeModalOrder.status}
                history={activeModalOrder.status_history}
              />
            </div>

            {/* Customer & Shipping */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Shipping Address & Contact</p>
              <p>{activeModalOrder.shipping_address.full_name} ({activeModalOrder.shipping_address.phone})</p>
              <p>{activeModalOrder.shipping_address.address_line1}, {activeModalOrder.shipping_address.city}</p>
              {activeModalOrder.notes && (
                <p className="text-slate-500 pt-1">Notes: {activeModalOrder.notes}</p>
              )}
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Items Ordered:</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {activeModalOrder.items?.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-slate-400">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-bold tabular-nums">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm">
                <span>Total COD Amount:</span>
                <span className="text-[#6C47FF]">{formatPrice(activeModalOrder.total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={getWhatsAppOrderUrl(activeModalOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send/View on WhatsApp ({ZENVO_WHATSAPP_RAW})</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setActiveModalOrder(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
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
