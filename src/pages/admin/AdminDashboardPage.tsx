import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Store,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminService, AdminDashboardStats } from '../../services/adminService';
import { formatPrice, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Order } from '../../types';
import { ROUTES } from '../../constants/routes';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const loadData = () => {
    setStats(adminService.getDashboardStats());
    setSellers(adminService.getAllSellers());
    setRecentOrders(adminService.getRecentOrders(8));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveSeller = (sellerId: string) => {
    adminService.approveSellerApplication(sellerId);
    loadData();
  };

  const handleRejectSeller = (sellerId: string) => {
    adminService.rejectSellerApplication(sellerId);
    loadData();
  };

  if (!stats) return null;

  const pendingSellers = sellers.filter((s) => s.profile.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Platform Overview & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System performance across all multi-vendor storefronts
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          ● Live Production Node
        </span>
      </div>

      {/* Pending Seller Applications Banner */}
      {pendingSellers.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Vendor Applications ({pendingSellers.length})</span>
            </div>
            <Link
              to={ROUTES.ADMIN_SELLERS}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline"
            >
              Review All Sellers
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSellers.map(({ profile, store }) => (
              <div
                key={profile.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {store?.store_name || profile.full_name}
                  </p>
                  <p className="text-slate-400 text-[11px]">{profile.email} · Phone: {profile.phone || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveSeller(profile.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectSeller(profile.id)}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 Stats Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Platform COD transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.totalOrders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.todayOrders} orders placed today</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Products</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.totalProducts}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all categories</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Sellers</span>
            <Store className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.totalSellers}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.pendingSellersCount} awaiting approval</p>
        </div>
      </div>

      {/* Recent Orders in Admin */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Recent Platform Orders
          </h2>
          <Link
            to={ROUTES.ADMIN_ORDERS}
            className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1"
          >
            <span>View Full Order Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {ord.customer_name} ({ord.customer_email})
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(ord.created_at)}</td>
                  <td className="py-3 px-3 font-bold tabular-nums">{formatPrice(ord.total)}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={ROUTES.ADMIN_ORDERS}
                      className="text-[#6C47FF] hover:underline font-semibold"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
