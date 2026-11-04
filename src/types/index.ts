/**
 * Zenvo Multi-Vendor E-Commerce Marketplace
 * Core Type Definitions based on Supabase PostgreSQL Schema
 */

export type UserRole = 'customer' | 'seller' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface HeroSettings {
  card1_image: string;
  card1_tag: string;
  card1_title: string;
  card2_image: string;
  card2_tag: string;
  card2_title: string;
  bg_image?: string;
}

export interface SellerProfile {
  id: string;
  seller_id: string;
  store_name: string;
  store_slug: string;
  store_description?: string;
  logo_url?: string;
  phone?: string;
  address?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  icon_url?: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  subcategories?: Category[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  low_stock_threshold: number;
  thumbnail_url?: string;
  is_active: boolean;
  is_approved: boolean;
  is_deleted: boolean;
  is_featured: boolean;
  order_count: number;
  created_at: string;
  updated_at: string;
  
  // Joined or enriched fields for UI
  seller_name?: string;
  seller_store_name?: string;
  category_name?: string;
  images?: ProductImage[];
}

export interface Address {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  title: string;
  thumbnail?: string;
  price: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note?: string;
  changed_by?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_id?: string | null;
  coupon_code?: string | null;
  payment_method: PaymentMethod;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_uses?: number | null;
  per_user_limit: number;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  customer_id: string;
  order_id: string;
  used_at: string;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'low_stock' | 'new_order' | 'order_update' | 'seller_approved';
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Cart Item in State
export interface CartItem {
  product: Product;
  quantity: number;
}
