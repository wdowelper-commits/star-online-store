import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Store,
  Shield,
  LogOut,
  PackageCheck,
  UserCheck,
  Layers,
  Grid,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { ROUTES } from '../../constants/routes';
import { db } from '../../lib/storage';

export const Navbar: React.FC = () => {
  const { user, setUser, signOut } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistItems = useWishlistStore((s) => s.items);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const switchDemoRole = (role: 'customer' | 'seller' | 'admin' | 'guest') => {
    if (role === 'guest') {
      signOut();
      navigate(ROUTES.HOME);
    } else if (role === 'admin') {
      const adminUser = db.getProfileByEmail('admin@zenvo.com');
      if (adminUser) setUser(adminUser);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else if (role === 'seller') {
      const sellerUser = db.getProfileByEmail('seller@zenvo.com');
      if (sellerUser) setUser(sellerUser);
      navigate(ROUTES.SELLER_DASHBOARD);
    } else if (role === 'customer') {
      const customerUser = db.getProfileByEmail('customer@zenvo.com');
      if (customerUser) setUser(customerUser);
      navigate(ROUTES.HOME);
    }
    setIsDemoOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top micro announcement bar */}
      <div className="bg-[#6C47FF] text-white text-[12px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-3 flex-wrap">
        <span>⚡ Nationwide Cash on Delivery (COD) · Free Shipping across Pakistan</span>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://api.whatsapp.com/send?phone=923027628552"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline hover:text-emerald-200 transition-colors inline-flex items-center gap-1"
        >
          <span>WhatsApp Order & Helpline: 03027628552</span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              to={ROUTES.HOME}
              className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-display"
            >
              <span className="text-[#6C47FF]">ZENVO</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              {/* All Categories Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-[#6C47FF] dark:text-purple-300 font-bold transition-colors cursor-pointer text-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isCategoriesDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-scale-up"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Departments ({db.getCategories().length})</span>
                      <Link
                        to={ROUTES.CATEGORIES}
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                        className="text-[#6C47FF] hover:underline normal-case font-bold"
                      >
                        All Directory →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-1">
                      {db.getCategories().map((cat) => (
                        <Link
                          key={cat.id}
                          to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
                          onClick={() => setIsCategoriesDropdownOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C47FF] transition-colors"
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#6C47FF] shrink-0">
                            {cat.name.charAt(0)}
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={ROUTES.PRODUCTS}
                className="hover:text-[#6C47FF] dark:hover:text-white transition-colors whitespace-nowrap"
              >
                All Products
              </Link>
              <Link
                to={`${ROUTES.PRODUCTS}?category=cat_electronics`}
                className="hover:text-[#6C47FF] dark:hover:text-white transition-colors whitespace-nowrap"
              >
                Electronics
              </Link>
              <Link
                to={`${ROUTES.PRODUCTS}?category=cat_leather`}
                className="hover:text-[#6C47FF] dark:hover:text-white transition-colors whitespace-nowrap"
              >
                Leather Goods
              </Link>
              <Link
                to={`${ROUTES.PRODUCTS}?category=cat_apparel`}
                className="hover:text-[#6C47FF] dark:hover:text-white transition-colors whitespace-nowrap"
              >
                Apparel
              </Link>
            </nav>
          </div>

          {/* Search Bar - Center */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, handcrafted bags, gadgets..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/90 dark:bg-slate-800 border border-transparent focus:border-[#6C47FF] dark:focus:border-[#6C47FF] focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Zone 3: Actions & Quick Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Demo Persona Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDemoOpen(!isDemoOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/50 text-[#6C47FF] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors"
                title="Switch persona for testing"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{user ? user.role : 'Guest'} Mode</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isDemoOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-xs font-medium animate-scale-up"
                  onMouseLeave={() => setIsDemoOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => switchDemoRole('customer')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>Customer (Bilal)</span>
                    {user?.role === 'customer' && <span className="text-[#6C47FF]">✓</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('seller')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>Seller (Tariq Crafts)</span>
                    {user?.role === 'seller' && <span className="text-[#6C47FF]">✓</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>Super Admin (Hamza)</span>
                    {user?.role === 'admin' && <span className="text-[#6C47FF]">✓</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('guest')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-500 border-t border-slate-100 dark:border-slate-800"
                  >
                    <span>Guest (Logged Out)</span>
                    {!user && <span className="text-[#6C47FF]">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to={ROUTES.WISHLIST}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors relative"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to={ROUTES.CART}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#6C47FF] dark:hover:text-[#6C47FF] rounded-lg transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#6C47FF] text-white text-[10px] font-bold flex items-center justify-center animate-bounce-short">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account dropdown / Login button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EDE9FF] dark:bg-[#6C47FF]/30 text-[#6C47FF] flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-semibold max-w-[90px] truncate">
                    {user.full_name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isAccountOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-sm font-medium animate-scale-up"
                    onMouseLeave={() => setIsAccountOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-50 text-[#6C47FF] dark:bg-purple-950/40 dark:text-purple-300">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <Shield className="w-4 h-4 text-[#6C47FF]" />
                        Admin Dashboard
                      </Link>
                    )}

                    {user.role === 'seller' && (
                      <Link
                        to={ROUTES.SELLER_DASHBOARD}
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <Store className="w-4 h-4 text-[#6C47FF]" />
                        Seller Dashboard
                      </Link>
                    )}

                    <Link
                      to={ROUTES.ACCOUNT}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to={ROUTES.ORDERS}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => {
                        signOut();
                        setIsAccountOpen(false);
                        navigate(ROUTES.HOME);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="px-4 py-2 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-xs"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              to={ROUTES.CATEGORIES}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] dark:text-purple-300 font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>All Categories / تمام کیٹیگریز</span>
              </div>
              <span className="text-[10px] bg-[#6C47FF] text-white px-1.5 py-0.5 rounded-full">
                {db.getCategories().length}
              </span>
            </Link>
            <Link
              to={ROUTES.PRODUCTS}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              All Products
            </Link>
            <Link
              to={`${ROUTES.PRODUCTS}?category=cat_electronics`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Electronics & Audio
            </Link>
            <Link
              to={`${ROUTES.PRODUCTS}?category=cat_leather`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Leather & Bags
            </Link>
            <Link
              to={`${ROUTES.PRODUCTS}?category=cat_apparel`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Apparel & Wear
            </Link>
            <Link
              to={`${ROUTES.PRODUCTS}?category=cat_footwear`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Footwear
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Quick Test Switcher:</span>
            <div className="flex gap-2">
              <button
                onClick={() => switchDemoRole('customer')}
                className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium"
              >
                Customer
              </button>
              <button
                onClick={() => switchDemoRole('seller')}
                className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium"
              >
                Seller
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
