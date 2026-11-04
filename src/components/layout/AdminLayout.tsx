import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  Layers,
  Ticket,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: 'Products', to: ROUTES.ADMIN_PRODUCTS, icon: Package },
    { label: 'Orders', to: ROUTES.ADMIN_ORDERS, icon: ShoppingBag },
    { label: 'Users', to: ROUTES.ADMIN_USERS, icon: Users },
    { label: 'Sellers', to: ROUTES.ADMIN_SELLERS, icon: Store },
    { label: 'Categories', to: ROUTES.ADMIN_CATEGORIES, icon: Layers },
    { label: 'Coupons', to: ROUTES.ADMIN_COUPONS, icon: Ticket },
  ];

  const handleSignOut = () => {
    signOut();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6C47FF]" />
          <span className="font-bold text-base font-display">Zenvo Admin</span>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 rounded-lg"
          aria-label="Toggle Navigation"
        >
          {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop 240px & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 z-40 inset-y-0 left-0 w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Header */}
          <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-[#6C47FF] text-white flex items-center justify-center font-bold text-sm">
              Z
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight font-display">ZENVO ADMIN</div>
              <div className="text-[10px] text-slate-400 font-medium">Control Center</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.ADMIN_DASHBOARD}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#EDE9FF] text-[#6C47FF] dark:bg-[#6C47FF]/20 dark:text-purple-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Exit Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Storefront</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>

          {user && (
            <div className="px-3 py-2 mt-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#6C47FF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
