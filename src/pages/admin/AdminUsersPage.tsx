import React, { useState, useEffect } from 'react';
import { Users, UserX, UserCheck, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Profile } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminUsersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Array<{ profile: Profile; orderCount: number; totalSpent: number }>>([]);
  const [search, setSearch] = useState('');

  const loadCustomers = () => {
    setCustomers(adminService.getAllCustomers());
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleSuspend = (userId: string) => {
    adminService.toggleUserSuspension(userId);
    loadCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Customer Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review registered customer records, purchase histories, and access status
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-64 focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total COD Spent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(({ profile, orderCount, totalSpent }) => (
                <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{profile.full_name || 'Customer'}</p>
                    <p className="text-[11px] text-slate-400">{profile.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {profile.phone || 'Not provided'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(profile.created_at)}</td>
                  <td className="py-3 px-4 font-bold tabular-nums text-slate-800 dark:text-slate-200">
                    {orderCount} orders
                  </td>
                  <td className="py-3 px-4 font-bold tabular-nums text-emerald-600">
                    {formatPrice(totalSpent)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={profile.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleSuspend(profile.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                        profile.status === 'suspended'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {profile.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
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
