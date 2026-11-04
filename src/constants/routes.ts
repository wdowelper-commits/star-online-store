/**
 * Zenvo Marketplace Route Constants
 */

export const ROUTES = {
  // Public
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string = ':id') => `/products/${id}`,
  SEARCH: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Customer
  ACCOUNT: '/account',
  ORDERS: '/account/orders',
  ORDER_DETAIL: (id: string = ':id') => `/account/orders/${id}`,
  WISHLIST: '/account/wishlist',
  
  // Seller
  SELLER_DASHBOARD: '/seller',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_ADD_PRODUCT: '/seller/products/add',
  SELLER_EDIT_PRODUCT: (id: string = ':id') => `/seller/products/${id}/edit`,
  SELLER_ORDERS: '/seller/orders',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_SELLERS: '/admin/sellers',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_COUPONS: '/admin/coupons',
} as const;
