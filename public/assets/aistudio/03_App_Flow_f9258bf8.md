# 03_App_Flow.md — User & Admin Experience / App Flow
## Project: Zenvo — Multi-Vendor E-Commerce Marketplace

---

## 1. Authentication Flow

### 1.1 Signup
```
/signup
  → User enters: name, email, password, role (customer / seller)
  → Zod validation
  → supabase.auth.signUp()
  → Supabase sends verification email
  → Show: "Email verification link bheja gaya hai. Please verify karein."
  → On email verify → redirect to /login
```

### 1.2 Login
```
/login
  → Email + Password OR "Google se Login" button
  → On success → fetch profiles row (role)
    ├── role = 'admin'    → redirect /admin
    ├── role = 'seller'   → redirect /seller
    └── role = 'customer' → redirect / (homepage)
  → On error → show inline error message
```

### 1.3 Google OAuth
```
/login → "Google se Login" button
  → supabase.auth.signInWithOAuth({ provider: 'google' })
  → Google consent screen
  → Callback → Supabase creates/updates user
  → Check profiles.role → redirect accordingly
  → If new Google user (no profile yet) → create profile with role='customer'
```

### 1.4 Forgot Password
```
/forgot-password
  → User enters email
  → supabase.auth.resetPasswordForEmail()
  → "Reset link bheja gaya" message
  → User clicks link → /reset-password page (Supabase redirect)
  → Enter new password → update
```

### 1.5 Protected Routes
```
Any protected page:
  → Check auth session (Zustand authStore)
  → Not logged in → redirect /login?redirect=<original_path>
  → Wrong role → redirect to correct dashboard (or 403 page)
  → Seller approval pending → show "Approval pending" page
```

---

## 2. Customer Flow

### 2.1 Homepage (/)
```
Load:
  ├── Hero banner (static or admin-configured)
  ├── Featured Categories (from categories table, featured=true)
  ├── Featured Products (products where featured=true, limit 8)
  └── Trending Products (order by order_count desc, limit 8)

Actions:
  ├── Click category → /products?category=<slug>
  ├── Click product card → /products/:id
  ├── Search bar → /search?q=<query>
  └── Add to wishlist (heart icon on card) → if not logged in → redirect /login
```

### 2.2 Product Listing (/products)
```
Load: All active/approved products

Filters (sidebar/sheet on mobile):
  ├── Category (checkbox list)
  ├── Price range (slider: min-max)
  ├── In Stock only (toggle)
  └── Sort: Newest / Price Low-High / Price High-Low

Pagination: 20 products per page

Empty state: "Koi product nahi mila" with clear filters button
Loading state: Skeleton cards (8 cards)
```

### 2.3 Product Detail (/products/:id)
```
Load:
  ├── Product images (gallery with thumbnail strip)
  ├── Title, price, seller name, category
  ├── Stock status (In Stock / Out of Stock / Low Stock: X remaining)
  ├── Description
  └── Seller info card

Actions:
  ├── Quantity selector (1 to min(10, stock))
  ├── "Cart Mein Daalein" button
  │   └── If out of stock → button disabled
  │   └── If not logged in → redirect /login
  ├── Wishlist toggle (heart button)
  └── Share button (copy URL)

Success: Cart icon animates, toast "Cart mein add ho gaya!"
```

### 2.4 Cart (/cart)
```
Load: cartStore (Zustand, localStorage-backed)

Display:
  ├── Cart items (image, name, seller, price, qty controls)
  ├── Remove item button
  ├── Coupon code input + "Apply" button
  │   ├── Valid coupon → show discount line, new total
  │   └── Invalid/expired → inline error
  └── Order Summary:
      ├── Subtotal
      ├── Discount (if coupon applied)
      ├── Delivery: Free (COD)
      └── Total

Actions:
  ├── "Checkout Karein" → if logged in → /checkout, else /login?redirect=/checkout
  └── "Shopping Jari Rakhein" → /products

Empty state: "Cart khali hai" with "Products Dekhein" button
```

### 2.5 Checkout (/checkout)
```
Protected: customer only

Step 1 — Shipping Address:
  ├── Full name, phone, address line 1, address line 2 (optional)
  ├── City, state, postal code
  └── "Saved addresses" dropdown (if any) OR "Naya Address"

Step 2 — Order Review:
  ├── Items summary (read-only)
  ├── Applied coupon (if any)
  ├── Payment: "Cash on Delivery" (locked, no other option)
  └── Total

Step 3 — Confirm:
  ├── "Order Place Karein" button
  ├── On click → create order + order_items in Supabase
  ├── Success → redirect /account/orders/:new_order_id
  └── Error → inline error, user can retry
```

### 2.6 Order Tracking (/account/orders/:id)
```
Load: order details + order_items + status history

Display:
  ├── Order ID, date, total
  ├── Items list (image, name, qty, price)
  ├── Shipping address
  ├── Payment: COD
  └── Status Timeline:
      ✅ Order Placed
      ⬜ Confirmed
      ⬜ Shipped
      ⬜ Delivered
      (OR) ❌ Cancelled

Cancel Order button:
  └── Visible only if status = 'placed' or 'confirmed'
  └── Confirmation modal: "Kya aap sure hain?"
  └── On confirm → update status to 'cancelled'
```

### 2.7 Wishlist (/account/wishlist)
```
Load: wishlist items with product details

Actions:
  ├── Remove from wishlist
  └── "Cart Mein Daalein" (direct add to cart)

Empty state: "Wishlist khali hai" + "Products Dekhein"
```

### 2.8 Account (/account)
```
Tabs:
  ├── Profile: name, email (readonly), phone — edit + save
  ├── Addresses: list of saved addresses, add/edit/delete
  └── Orders: list of all orders (link to detail)
```

---

## 3. Seller Flow

### 3.1 Seller Registration
```
/signup → Select role: "Seller"
  → Additional fields: Store name, store description, phone
  → Submit → profile created with role='seller', status='pending'
  → Show: "Aapki application admin ke paas review ke liye gayi hai."
  → Admin approves → seller gets email notification → can now login fully
```

### 3.2 Seller Dashboard (/seller)
```
Load:
  ├── Stats cards: Total Products, Total Orders, Revenue (COD total), Low Stock alerts count
  ├── Recent Orders table (last 5)
  └── Low Stock Products list (stock <= threshold)

Actions:
  └── Quick links to Products, Orders pages
```

### 3.3 Seller Products (/seller/products)
```
Load: All products where seller_id = auth.uid()

Table columns: Image, Name, Category, Price, Stock, Status (active/inactive), Actions

Actions per row:
  ├── Edit → /seller/products/:id/edit
  └── Delete → confirmation modal → soft delete (is_deleted=true)

Toggle active/inactive (switch)
"Naya Product Add Karein" button → /seller/products/add

Empty state: "Koi product nahi. Pehla product add karein!"
```

### 3.4 Add/Edit Product (/seller/products/add, /seller/products/:id/edit)
```
Form fields:
  ├── Title (required)
  ├── Description (textarea, required)
  ├── Category (dropdown from categories table)
  ├── Price (number, required)
  ├── Compare-at price / Original price (optional, for showing discount)
  ├── Stock quantity (number, required)
  ├── Low stock threshold (number, default 5)
  ├── Images (up to 5 images upload, drag-reorder, first = thumbnail)
  │   └── Upload to Supabase Storage → store URLs in product_images table
  ├── Is Active toggle (default true)
  └── Submit

Validation: Zod schema
Success: toast + redirect /seller/products
Error: inline field errors
```

### 3.5 Seller Orders (/seller/orders)
```
Load: Orders containing products from this seller (join via order_items)

Table: Order ID, Customer name, Items (count), Total, Status, Date, Actions

Filter by status: All / Placed / Confirmed / Shipped / Delivered / Cancelled

Action:
  └── Update Status (Seller can only: Placed→Confirmed, Confirmed→Shipped)
      └── Dropdown in row → confirm modal → update

Order detail view (modal or page):
  ├── Customer shipping address
  ├── Items from this seller only
  └── Status update control
```

---

## 4. Admin Flow

### 4.1 Admin Dashboard (/admin)
```
Stats cards (top row):
  Total Orders | Today's Orders | Total Revenue | Total Products
  Total Users | Total Sellers | Pending Seller Applications | Low Stock Products

Charts (optional but recommended):
  └── Orders per day (last 7 days) — bar chart

Recent Activity:
  ├── Recent Orders table (last 10)
  └── Pending Seller Applications (if any)
```

### 4.2 Admin Products (/admin/products)
```
Table: All products (all sellers)
Columns: Image, Name, Seller, Category, Price, Stock, Status, Actions

Filters: Category, Seller, Status (active/inactive), Low Stock

Actions per row:
  ├── Edit product (any field)
  ├── Approve / Reject / Suspend
  └── Delete

Bulk actions: Select multiple → Approve/Reject/Delete
```

### 4.3 Admin Orders (/admin/orders)
```
Table: All orders
Columns: Order ID, Customer, Items, Total, Payment (COD), Status, Date, Actions

Filters: Status, Date range, Search by Order ID or customer email

Actions per row:
  ├── View detail (modal)
  └── Update status (full range: Placed→Confirmed→Shipped→Delivered, or Cancelled)
```

### 4.4 Admin Users (/admin/users)
```
Table: All customer accounts
Columns: Name, Email, Joined date, Total orders, Status (active/suspended)

Actions:
  ├── View order history
  └── Suspend / Reactivate account
```

### 4.5 Admin Sellers (/admin/sellers)
```
Table: All seller applications + active sellers
Columns: Store name, Email, Status (pending/active/suspended), Products count, Joined

Pending Applications section (top):
  └── Approve / Reject buttons

Active sellers:
  └── Suspend / Reactivate, View products
```

### 4.6 Admin Categories (/admin/categories)
```
Two-level category tree:
  └── Parent Category → Subcategories

Add/Edit form: Name, slug (auto-generate from name), parent (optional), featured toggle, icon (emoji or image URL)
Delete: only if no products assigned
```

### 4.7 Admin Coupons (/admin/coupons)
```
Table: Code, Type (%), Discount, Min Order, Expiry, Usage (used/total), Status

Add/Edit modal:
  ├── Code (uppercase, auto-validate uniqueness)
  ├── Type: Percentage or Fixed
  ├── Discount value
  ├── Minimum order value
  ├── Expiry date
  ├── Max total uses
  ├── Per-user limit
  └── Active toggle

Actions: Edit, Deactivate, Delete
```

---

## 5. States Reference

| State | How to show |
|-------|-------------|
| Loading | Skeleton placeholders (cards, rows) |
| Empty | Illustration + message + action button |
| Error (network) | Toast or inline error with "Retry" button |
| Form error | Red border + message under each field |
| Form success | Toast notification, optional redirect |
| Out of stock | Greyed card, "Out of Stock" badge, button disabled |
| Low stock | Yellow badge "Sirf X reh gaya!" |
| Pending approval | Banner with explanation |
| Suspended account | Login blocked, message shown |

---

## 6. Navigation Structure

### Public Navbar
```
[Zenvo Logo] [Search Bar] [Categories ▾] | [Wishlist] [Cart(count)] [Login/Account ▾]
```

### Customer Account Menu (dropdown)
```
My Account | My Orders | Wishlist | Logout
```

### Seller Sidebar
```
Dashboard | My Products | Orders | My Profile | Logout
```

### Admin Sidebar
```
Dashboard | Products | Orders | Users | Sellers | Categories | Coupons | Logout
```
