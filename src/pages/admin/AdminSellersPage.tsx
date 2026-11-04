import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Clock, ShieldCheck, Phone } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Profile, SellerProfile } from '../../types';
import { formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminSellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<
    Array<{ profile: Profile; store?: SellerProfile; productCount: number }>
  >([]);

  const loadSellers = () => {
    setSellers(adminService.getAllSellers());
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleApprove = (sellerId: string) => {
    adminService.approveSellerApplication(sellerId);
    loadSellers();
  };

  const handleReject = (sellerId: string) => {
    adminService.rejectSellerApplication(sellerId);
    loadSellers();
  };

  const handleToggleSuspend = (sellerId: string) => {
    adminService.toggleUserSuspension(sellerId);
    loadSellers();
  };

  const pendingSellers = sellers.filter((s) => s.profile.status === 'pending');
  const activeSellers = sellers.filter((s) => s.profile.status !== 'pending');

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          Multi-Vendor Seller Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Approve vendor applications and oversee registered seller storefronts
        </p>
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Pending Applications ({pendingSellers.length})
          </h2>
        </div>

        {pendingSellers.length === 0 ? (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No pending seller applications awaiting review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSellers.map(({ profile, store }) => (
              <div
                key={profile.id}
                className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {store?.store_name || 'Vendor Store'}
                    </h3>
                    <p className="text-xs text-slate-500">Owner: {profile.full_name}</p>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    Pending
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Email: {profile.email}</p>
                  <p>Phone: {profile.phone || store?.phone || 'Not provided'}</p>
                  {store?.store_description && (
                    <p className="italic text-slate-500 pt-1">"{store.store_description}"</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => handleReject(profile.id)}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(profile.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Vendor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active / All Sellers Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Active & Registered Vendors ({activeSellers.length})
        </h2>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Store / Brand</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Catalog Products</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSellers.map(({ profile, store, productCount }) => (
                  <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {store?.store_name || profile.full_name}
                      </p>
                      <p className="text-[10px] text-slate-400">Owner: {profile.full_name}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <p>{profile.email}</p>
                      <p className="text-[10px] text-slate-400">{profile.phone || 'No phone'}</p>
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums text-slate-800 dark:text-slate-200">
                      {productCount} items
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(profile.created_at)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={profile.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(profile.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
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
    </div>
  );
};
