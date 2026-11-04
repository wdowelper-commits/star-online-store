import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sellerService } from '../../services/sellerService';
import { formatPrice, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ROUTES } from '../../constants/routes';

export const SellerDashboardPage: React.FC = () => {
  const { user, sellerProfile } = useAuthStore();

  if (!user) return null;

  const stats = sellerService.getSellerStats(user.id);
  const lowStockProducts = sellerService.getSellerLowStockProducts(user.id);
  const recentOrders = sellerService.getRecentSellerOrders(user.id, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Seller Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store: <strong className="text-slate-800 dark:text-slate-200">{sellerProfile?.store_name || user.full_name}</strong>
          </p>
        </div>

        <Link
          to={ROUTES.SELLER_ADD_PRODUCT}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From non-cancelled COD orders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.totalOrders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Customer orders placed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Products</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6C47FF] dark:bg-purple-950/40 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.totalProducts}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Catalog items listed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.lowStockCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Items at or below threshold</p>
        </div>
      </div>

      {/* Low Stock Alerts Strip */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low Stock Inventory Alert ({lowStockProducts.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs"
              >
                <div className="truncate mr-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{p.title}</p>
                  <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                    Remaining: {p.stock} units (Threshold: {p.low_stock_threshold})
                  </p>
                </div>
                <Link
                  to={ROUTES.SELLER_EDIT_PRODUCT(p.id)}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold shrink-0"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders for Seller */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Recent Orders for Your Products
          </h2>
          <Link
            to={ROUTES.SELLER_ORDERS}
            className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No orders received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(ord.created_at)}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {ord.customer_name || 'Customer'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={ROUTES.SELLER_ORDERS}
                        className="text-[#6C47FF] hover:underline font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
