-- ==============================================================================
-- ZENVO MULTI-VENDOR E-COMMERCE MARKETPLACE - COMPLETE SUPABASE SQL SCHEMA
-- Run this complete script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- 2.1 Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  username      TEXT UNIQUE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- 2.2 Seller Profiles Table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name        TEXT NOT NULL,
  store_slug        TEXT NOT NULL UNIQUE,
  store_description TEXT,
  logo_url          TEXT,
  phone             TEXT,
  address           TEXT,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seller_profiles_seller_id_idx ON public.seller_profiles(seller_id);
CREATE INDEX IF NOT EXISTS seller_profiles_slug_idx ON public.seller_profiles(store_slug);

-- 2.3 Categories Table (Self-referencing for parent/child categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon_url    TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);

-- 2.4 Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  price               NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price    NUMERIC(10, 2) CHECK (compare_at_price >= 0),
  stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  thumbnail_url       TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved         BOOLEAN NOT NULL DEFAULT TRUE, -- direct active for fast onboarding
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  order_count         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_is_active_approved_idx ON public.products(is_active, is_approved, is_deleted);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS products_stock_idx ON public.products(stock) WHERE stock <= low_stock_threshold;

-- 2.5 Product Images Table (Multi-image support: URLs or storage paths)
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);

-- 2.6 Saved Shipping Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  postal_code   TEXT NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS addresses_customer_id_idx ON public.addresses(customer_id);

-- 2.7 Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  discount_type     TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value    NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_uses          INTEGER,           -- NULL = unlimited
  per_user_limit    INTEGER NOT NULL DEFAULT 1,
  used_count        INTEGER NOT NULL DEFAULT 0,
  expires_at        TIMESTAMPTZ,       -- NULL = no expiry
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons(code);
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON public.coupons(is_active);

-- 2.8 Orders Table (Cash on Delivery + WhatsApp routing)
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT NOT NULL UNIQUE,   -- e.g. ORD-2026-0001
  customer_id         UUID NOT NULL REFERENCES public.profiles(id),
  shipping_address    JSONB NOT NULL,          -- Snapshot of address at order placement
  subtotal            NUMERIC(10, 2) NOT NULL,
  discount_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total               NUMERIC(10, 2) NOT NULL,
  coupon_id           UUID REFERENCES public.coupons(id),
  coupon_code         TEXT,
  payment_method      TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method = 'cod'),
  status              TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','confirmed','shipped','delivered','cancelled')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

-- 2.9 Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id),
  seller_id   UUID NOT NULL REFERENCES public.profiles(id),
  title       TEXT NOT NULL,
  thumbnail   TEXT,
  price       NUMERIC(10, 2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_seller_id_idx ON public.order_items(seller_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- 2.10 Order Status History Log
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON public.order_status_history(order_id);

-- 2.11 Coupon Usages Table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES public.orders(id),
  used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, order_id)
);

CREATE INDEX IF NOT EXISTS coupon_usages_coupon_customer_idx ON public.coupon_usages(coupon_id, customer_id);

-- 2.12 Wishlists Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlists_customer_id_idx ON public.wishlists(customer_id);

-- 2.13 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,   -- 'low_stock', 'new_order', 'order_update', 'seller_approved'
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ==============================================================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: updated_at timestamp auto-update
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_seller_profiles_updated_at ON public.seller_profiles;
CREATE TRIGGER set_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger: Automatically create public.profiles row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Zenvo User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'seller' THEN 'pending'
      ELSE 'active'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Decrement stock and increment order_count upon order_items insert
CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - NEW.quantity),
      order_count = order_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_decrement_stock ON public.order_items;
CREATE TRIGGER trigger_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrement_product_stock();

-- Trigger: Restore stock when order status changes to 'cancelled'
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_restore_stock_cancel ON public.orders;
CREATE TRIGGER trigger_restore_stock_cancel
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_cancel();

-- Trigger: Log order status change in history
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, 'Status updated to ' || NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_order_status ON public.orders;
CREATE TRIGGER trigger_log_order_status
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4.2 Seller Profiles Policies
CREATE POLICY "Seller profiles viewable by everyone"
  ON public.seller_profiles FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own profile"
  ON public.seller_profiles FOR ALL
  USING (auth.uid() = seller_id OR public.is_admin())
  WITH CHECK (auth.uid() = seller_id OR public.is_admin());

-- 4.3 Categories Policies
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.4 Products Policies
CREATE POLICY "Active approved products are viewable by everyone"
  ON public.products FOR SELECT
  USING (
    (is_active = TRUE AND is_approved = TRUE AND is_deleted = FALSE)
    OR auth.uid() = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Sellers can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = seller_id OR public.is_admin());

CREATE POLICY "Sellers can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = seller_id OR public.is_admin())
  WITH CHECK (auth.uid() = seller_id OR public.is_admin());

CREATE POLICY "Sellers can soft-delete or admins delete products"
  ON public.products FOR DELETE
  USING (auth.uid() = seller_id OR public.is_admin());

-- 4.5 Product Images Policies
CREATE POLICY "Product images viewable by everyone"
  ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Sellers and admins can manage product images"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (p.seller_id = auth.uid() OR public.is_admin())
    )
  );

-- 4.6 Addresses Policies
CREATE POLICY "Users manage own shipping addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = customer_id OR public.is_admin())
  WITH CHECK (auth.uid() = customer_id OR public.is_admin());

-- 4.7 Coupons Policies
CREATE POLICY "Active coupons viewable by all authenticated users"
  ON public.coupons FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Only admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.8 Orders Policies
CREATE POLICY "Customers view own orders, sellers view items, admins view all"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = orders.id AND oi.seller_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR public.is_admin());

CREATE POLICY "Customers can cancel pending, sellers update status, admins manage"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = orders.id AND oi.seller_id = auth.uid()
    )
  );

-- 4.9 Order Items Policies
CREATE POLICY "Order items viewable by order owner, seller, or admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.customer_id = auth.uid() OR order_items.seller_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Authenticated users can insert order items with orders"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- 4.10 Wishlists Policies
CREATE POLICY "Users manage own wishlist items"
  ON public.wishlists FOR ALL
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- 4.11 Notifications Policies
CREATE POLICY "Users view and manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 5. STORAGE BUCKETS (Product Images & Store Logos)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-assets', 'seller-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Read for product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Uploads for product-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read for seller-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'seller-assets');

CREATE POLICY "Authenticated Uploads for seller-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'seller-assets' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 6. INITIAL SEED DATA (Categories & Coupons)
-- ==============================================================================

-- Top-level categories
INSERT INTO public.categories (id, name, slug, parent_id, icon_url, is_featured, sort_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Handcrafted Leather', 'leather-goods', NULL, 'Briefcase', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000002', 'High-Fidelity Audio', 'electronics-audio', NULL, 'Headphones', TRUE, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Handloom & Textiles', 'handloom-textiles', NULL, 'Sparkles', TRUE, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Footwear & Boots', 'footwear-boots', NULL, 'Footprints', TRUE, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Artisan Homeware', 'artisan-homeware', NULL, 'Home', TRUE, 5)
ON CONFLICT (slug) DO NOTHING;

-- Working discount coupons
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_value, max_uses, per_user_limit, is_active)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'ZENVO10', 'percentage', 10.00, 1500.00, 500, 1, TRUE),
  ('d1000000-0000-0000-0000-000000000002', 'WELCOME500', 'fixed', 500.00, 3000.00, 200, 1, TRUE),
  ('d1000000-0000-0000-0000-000000000003', 'FREESHIP', 'fixed', 250.00, 1000.00, NULL, 5, TRUE)
ON CONFLICT (code) DO NOTHING;
