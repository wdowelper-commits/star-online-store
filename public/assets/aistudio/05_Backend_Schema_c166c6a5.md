# 05_Backend_Schema.md — Backend Schema (Supabase/PostgreSQL)
## Project: Zenvo — Multi-Vendor E-Commerce Marketplace

> **Note:** Ye sirf planning document hai. Database is file se automatically nahi banta.
> ChatGPT is schema ke mutabiq Supabase mein sab kuch banayega (Section 8 of workflow).

---

## 1. Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | All users (customers, sellers, admin) — extends Supabase auth.users |
| `categories` | Product categories (two levels: parent + sub) |
| `products` | All products (linked to seller) |
| `product_images` | Multiple images per product |
| `orders` | Customer orders (COD) |
| `order_items` | Individual line items per order |
| `order_status_history` | Status change log per order |
| `coupons` | Discount coupons |
| `coupon_usages` | Tracks per-user coupon usage |
| `wishlists` | Customer wishlist items |
| `addresses` | Customer saved shipping addresses |
| `seller_profiles` | Extended seller info (store name, logo, etc.) |
| `notifications` | Admin/Seller notifications (low stock, new order) |

---

## 2. Table Definitions

### 2.1 profiles
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:** `profiles_role_idx ON profiles(role)`, `profiles_status_idx ON profiles(status)`

**Notes:**
- `id` maps to `auth.users.id` — one-to-one
- `role = 'seller'` + `status = 'pending'` = awaiting admin approval
- `role = 'seller'` + `status = 'active'` = approved seller

---

### 2.2 seller_profiles
```sql
CREATE TABLE seller_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  store_name      TEXT NOT NULL,
  store_slug      TEXT NOT NULL UNIQUE,
  store_description TEXT,
  logo_url        TEXT,
  phone           TEXT,
  address         TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:** `seller_profiles_seller_id_idx ON seller_profiles(seller_id)`, `seller_profiles_slug_idx ON seller_profiles(store_slug)`

---

### 2.3 categories
```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon_url    TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:** `categories_parent_id_idx ON categories(parent_id)`, `categories_slug_idx ON categories(slug)`

**Notes:**
- `parent_id IS NULL` = top-level category
- `parent_id IS NOT NULL` = subcategory

---

### 2.4 products
```sql
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  price               NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price    NUMERIC(10, 2) CHECK (compare_at_price >= 0),
  stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  thumbnail_url       TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved         BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  order_count         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX products_seller_id_idx ON products(seller_id);
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_is_active_approved_idx ON products(is_active, is_approved, is_deleted);
CREATE INDEX products_featured_idx ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX products_stock_idx ON products(stock) WHERE stock <= low_stock_threshold;
```

**Notes:**
- `is_deleted = TRUE` = soft delete (not visible anywhere)
- `is_approved = FALSE` = pending admin approval (visible to seller + admin only)
- `order_count` incremented via trigger on order_items insert

---

### 2.5 product_images
```sql
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:** `product_images_product_id_idx ON product_images(product_id)`

**Notes:** Max 5 images per product. First by `sort_order` is the thumbnail (also stored in `products.thumbnail_url`).

---

### 2.6 addresses
```sql
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
```

**Indexes:** `addresses_customer_id_idx ON addresses(customer_id)`

---

### 2.7 orders
```sql
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT NOT NULL UNIQUE,   -- e.g. ZNV-2026-00001
  customer_id         UUID NOT NULL REFERENCES profiles(id),
  shipping_address    JSONB NOT NULL,          -- snapshot of address at order time
  subtotal            NUMERIC(10, 2) NOT NULL,
  discount_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total               NUMERIC(10, 2) NOT NULL,
  coupon_id           UUID REFERENCES coupons(id),
  coupon_code         TEXT,
  payment_method      TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method = 'cod'),
  status              TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','confirmed','shipped','delivered','cancelled')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX orders_customer_id_idx ON orders(customer_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);
```

**Notes:**
- `order_number` auto-generated: trigger or application-level (format: `ZNV-YYYY-NNNNN`)
- `shipping_address` stored as JSONB snapshot so address changes don't affect old orders

---

### 2.8 order_items
```sql
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  seller_id   UUID NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL,           -- snapshot of product title
  thumbnail   TEXT,                    -- snapshot
  price       NUMERIC(10, 2) NOT NULL, -- snapshot of price at order time
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(10, 2) NOT NULL  -- price * quantity
);
```

**Indexes:**
```sql
CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_seller_id_idx ON order_items(seller_id);
CREATE INDEX order_items_product_id_idx ON order_items(product_id);
```

---

### 2.9 order_status_history
```sql
CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:** `order_status_history_order_id_idx ON order_status_history(order_id)`

---

### 2.10 coupons
```sql
CREATE TABLE coupons (
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
```

**Indexes:** `coupons_code_idx ON coupons(code)`, `coupons_is_active_idx ON coupons(is_active)`

---

### 2.11 coupon_usages
```sql
CREATE TABLE coupon_usages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES orders(id),
  used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, order_id)
);
```

**Indexes:** `coupon_usages_coupon_customer_idx ON coupon_usages(coupon_id, customer_id)`

---

### 2.12 wishlists
```sql
CREATE TABLE wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, product_id)
);
```

**Indexes:** `wishlists_customer_id_idx ON wishlists(customer_id)`

---

### 2.13 notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,   -- 'low_stock', 'new_order', 'order_update', 'seller_approved'
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:** `notifications_user_id_unread_idx ON notifications(user_id, is_read) WHERE is_read = FALSE`

---

## 3. Relationships Diagram

```
auth.users (Supabase)
    ↕ 1:1
profiles
    ├── 1:1 → seller_profiles (sellers only)
    ├── 1:N → products (as seller)
    ├── 1:N → orders (as customer)
    ├── 1:N → addresses
    ├── 1:N → wishlists
    └── 1:N → notifications

categories
    ├── self-ref (parent_id) for subcategories
    └── 1:N → products

products
    ├── 1:N → product_images
    ├── 1:N → order_items
    └── 1:N → wishlists

orders
    ├── 1:N → order_items
    ├── 1:N → order_status_history
    └── N:1 → coupons (optional)

coupons
    └── 1:N → coupon_usages
```

---

## 4. RLS Policies (Requirements for ChatGPT)

### profiles
- SELECT: user can read own row; admin can read all
- UPDATE: user can update own row (except role/status); admin can update all
- INSERT: handled by Supabase Auth trigger (auto-insert on signup)

### products
- SELECT: anyone can read `is_active=true, is_approved=true, is_deleted=false`; seller reads own; admin reads all
- INSERT: seller (status=active) only, seller_id must equal auth.uid()
- UPDATE: seller can update own products; admin can update any
- DELETE: seller soft-deletes own (set is_deleted=true); admin can hard delete

### orders
- SELECT: customer reads own; seller reads orders containing their products; admin reads all
- INSERT: authenticated customer only
- UPDATE: customer can cancel own (placed/confirmed); seller updates own items' fulfillment; admin updates any

### order_items
- SELECT: same as orders (via join policy)
- INSERT: system only (created with order)

### wishlists
- ALL: customer can manage own only (customer_id = auth.uid())

### addresses
- ALL: customer can manage own only

### coupons
- SELECT: authenticated users (for validation); admin for management
- INSERT/UPDATE/DELETE: admin only

### coupon_usages
- SELECT/INSERT: customer for own usage; admin reads all

### categories
- SELECT: public (all)
- INSERT/UPDATE/DELETE: admin only

### seller_profiles
- SELECT: public (all)
- INSERT/UPDATE: seller owns own row (seller_id = auth.uid()); admin can update any

### notifications
- SELECT/UPDATE: user reads/marks own notifications; admin reads all
- INSERT: server-side / admin only (via service function)

---

## 5. Database Functions & Triggers

### 5.1 Auto-create profile on signup
```sql
-- Trigger: after auth.users INSERT
-- Creates profiles row with email from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5.2 Decrement stock on order
```sql
-- Trigger: after order_items INSERT
-- Decrements products.stock by quantity
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity,
      order_count = order_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.3 Restore stock on order cancel
```sql
-- Trigger: after orders UPDATE where status changes to 'cancelled'
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE products p
    SET stock = p.stock + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.4 Order status history log
```sql
-- Trigger: after orders UPDATE where status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.5 updated_at auto-update
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply to: profiles, products, orders
```

---

## 6. Storage Buckets

| Bucket | Access | Path Pattern |
|--------|--------|-------------|
| `product-images` | Public read | `{seller_id}/{product_id}/{filename}` |
| `seller-assets` | Public read | `{seller_id}/logo/{filename}` |

**Policies:**
- `product-images`: Authenticated sellers can INSERT/UPDATE/DELETE in their own folder (path starts with auth.uid()); public SELECT
- `seller-assets`: Same pattern

---

## 7. Auth Settings (Supabase Dashboard)

- Email/Password: **Enabled**
- Email verification: **Enabled**
- Google OAuth: **Enabled** (requires Google Cloud credentials in Supabase Auth providers)
- JWT expiry: 3600 seconds (1 hour), refresh token: 30 days
- Password minimum length: 8 characters
