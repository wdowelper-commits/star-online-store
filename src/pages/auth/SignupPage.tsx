import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, Store, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { ROUTES } from '../../constants/routes';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Seller specific fields
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storePhone, setStorePhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (role === 'seller' && (!storeName.trim() || !storePhone.trim())) {
      setError('Please provide your Store Name and Contact Phone Number.');
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await authService.signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim(),
        storePhone: storePhone.trim(),
      });

      setUser(user);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {role === 'seller' ? 'Application Submitted!' : 'Account Created Successfully!'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {role === 'seller'
              ? 'Aapki seller application review ke liye submit ho chuki hai. Admin approval ke baad aap products add kar sakenge.'
              : 'Aapka customer account tayar hai. Aap ab products browse aur Cash on Delivery orders place kar sakte hain.'}
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate(role === 'seller' ? ROUTES.SELLER_DASHBOARD : ROUTES.HOME)}
              className="w-full py-3 px-4 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              {role === 'seller' ? 'Seller Portal Par Jayein' : 'Shopping Shuru Karein'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <Link to={ROUTES.HOME} className="text-2xl font-extrabold text-[#6C47FF] font-display">
            ZENVO
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
            Create Your Zenvo Account
          </h1>
          <p className="text-xs text-slate-500">
            Join thousands of shoppers and verified local vendors.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'customer'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>I am a Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'seller'
                ? 'bg-white dark:bg-slate-900 text-[#6C47FF] dark:text-purple-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>I am a Seller / Vendor</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-200 dark:border-red-900/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          {/* Conditional Seller Fields */}
          {role === 'seller' && (
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 rounded-2xl space-y-3 pt-4">
              <div className="text-xs font-bold text-[#6C47FF] uppercase tracking-wider">
                Seller & Store Details
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store / Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Lahore Leather House"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Support Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="+92 321 0000000"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Description
                </label>
                <textarea
                  rows={2}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Briefly describe what products your studio manufactures or crafts"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Notice: Seller applications are reviewed by platform administration before product listing rights are activated.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : role === 'seller' ? 'Apply as Seller' : 'Create Customer Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-bold text-[#6C47FF] hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
