import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { SellerLayout } from './components/layout/SellerLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGuard } from './components/common/RoleGuard';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import { useWishlistStore } from './store/wishlistStore';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProductListPage } from './pages/public/ProductListPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { SearchPage } from './pages/public/SearchPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Customer Pages
import { AccountPage } from './pages/customer/AccountPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { WishlistPage } from './pages/customer/WishlistPage';

// Seller Pages
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { SellerAddProductPage } from './pages/seller/SellerAddProductPage';
import { SellerEditProductPage } from './pages/seller/SellerEditProductPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSellersPage } from './pages/admin/AdminSellersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';

// Main Public Layout Shell
const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-[#F8F8FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <AIAssistantDrawer />
  </div>
);

export default function App() {
  const { user, refreshUser } = useAuthStore();
  const { loadWishlist } = useWishlistStore();

  useEffect(() => {
    refreshUser();
    if (user) {
      loadWishlist(user.id);
    }
  }, [user?.id]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner fullPage label="Initializing Zenvo Marketplace..." />}>
        <Routes>
          {/* Public & Customer Routes with Navbar + Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Customer Account Routes */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 within storefront */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Seller Portal Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['seller', 'admin']}>
                  <SellerLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerDashboardPage />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="products/add" element={<SellerAddProductPage />} />
            <Route path="products/:id/edit" element={<SellerEditProductPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="sellers" element={<AdminSellersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
