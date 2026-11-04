import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { couponService } from '../../services/couponService';
import { Coupon, DiscountType } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('1000');
  const [maxUses, setMaxUses] = useState('500');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  const loadCoupons = () => {
    setCoupons(couponService.getAllCoupons());
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinOrderValue('1000');
    setMaxUses('200');
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(String(c.discount_value));
    setMinOrderValue(String(c.min_order_value));
    setMaxUses(c.max_uses ? String(c.max_uses) : '');
    setIsActive(c.is_active);
    setError('');
    setIsModalOpen(true);
  };

  const handleToggleActive = (coupon: Coupon) => {
    couponService.updateCoupon(coupon.id, { is_active: !coupon.is_active });
    loadCoupons();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(discountValue);
    const minVal = parseFloat(minOrderValue) || 0;
    const uses = maxUses ? parseInt(maxUses, 10) : null;

    if (!code.trim()) {
      setError('Please provide a coupon code.');
      return;
    }
    if (isNaN(val) || val <= 0) {
      setError('Please provide a valid discount value.');
      return;
    }

    try {
      if (editingCoupon) {
        couponService.updateCoupon(editingCoupon.id, {
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: val,
          min_order_value: minVal,
          max_uses: uses,
          is_active: isActive,
        });
      } else {
        couponService.createCoupon({
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: val,
          min_order_value: minVal,
          max_uses: uses,
          per_user_limit: 1,
          is_active: isActive,
        });
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      setError(err?.message || 'Failed to save coupon.');
    }
  };

  const handleDelete = (id: string) => {
    couponService.deleteCoupon(id);
    loadCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Discount Coupon Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create percentage and flat amount discount vouchers for customer checkout
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-semibold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min Order Value</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-[#6C47FF] dark:text-purple-300 font-mono text-sm tracking-wide bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">
                    {coupon.discount_type}
                  </td>
                  <td className="py-3 px-4 font-bold tabular-nums text-slate-900 dark:text-white">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% Off`
                      : formatPrice(coupon.discount_value) + ' Off'}
                  </td>
                  <td className="py-3 px-4 tabular-nums text-slate-600 dark:text-slate-400">
                    {formatPrice(coupon.min_order_value)}
                  </td>
                  <td className="py-3 px-4 tabular-nums text-slate-600 dark:text-slate-400">
                    {coupon.used_count} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        coupon.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(coupon)}
                        className="p-1.5 text-slate-400 hover:text-[#6C47FF] rounded-lg cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coupon Code (Uppercase) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE20"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '15' : '500'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Total Uses
                  </label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#6C47FF] rounded accent-[#6C47FF]"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Activate coupon immediately for checkout
                </span>
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C47FF] text-white rounded-xl font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
