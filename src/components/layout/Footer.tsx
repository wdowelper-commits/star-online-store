import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Trust Pillars Bar */}
      <div className="border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cash on Delivery</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pay when order reaches your door</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Verified Vendors</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">100% vetted multi-vendor quality</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Easy Returns</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">7-day hassle free inspection</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customer Support</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dedicated assistance 7 days a week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              <span className="text-[#6C47FF]">ZENVO</span>
            </span>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pakistan & South Asia's curated multi-vendor marketplace connecting authentic independent artisans and manufacturers directly to modern consumers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to={`${ROUTES.PRODUCTS}?category=cat_electronics`} className="hover:text-[#6C47FF]">Electronics & Audio</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=cat_leather`} className="hover:text-[#6C47FF]">Leather & Accessories</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=cat_apparel`} className="hover:text-[#6C47FF]">Handloom & Apparel</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=cat_footwear`} className="hover:text-[#6C47FF]">Artisan Footwear</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=cat_home`} className="hover:text-[#6C47FF]">Home Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Sell on Zenvo
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to={ROUTES.SIGNUP} className="hover:text-[#6C47FF]">Become a Seller</Link></li>
              <li><Link to={ROUTES.SELLER_DASHBOARD} className="hover:text-[#6C47FF]">Vendor Dashboard</Link></li>
              <li><Link to={ROUTES.ADMIN_DASHBOARD} className="hover:text-[#6C47FF]">Admin Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Customer Care
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              Order tracking, shipping guidelines, and customer inquiries:
            </p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">support@zenvomarket.com</p>
            <p className="text-xs text-slate-500 mt-1">UAN: +92 (042) 111-ZENVO-1</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Zenvo Marketplace Ltd. All rights reserved.</p>
          <p className="text-slate-400">Engineered with high performance React & TypeScript.</p>
        </div>
      </div>
    </footer>
  );
};
