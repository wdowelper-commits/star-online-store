# 06_Implementation_Plan.md — Implementation Plan
## Project: Zenvo — Multi-Vendor E-Commerce Marketplace

> **For Google AI Studio (Internal Execution Plan)**
> Ye document AI Studio ke liye ek build order hai. User ko phase-wise prompts nahi dene; sirf `Follow the plan` message ke saath ye 6 files de deni hain.
> AI Studio ko ek hi baar mein poori React + TypeScript website banani hai is plan ke mutabiq.

---

## 1. Tech Stack Reminder

- React 18 + TypeScript + Vite
- React Router v6
- Zustand (state management)
- Tailwind CSS v3
- shadcn/ui components (Radix-based)
- React Hook Form + Zod
- Lucide React (icons)
- @supabase/supabase-js
- Google Fonts: Plus Jakarta Sans + Inter

---

## 2. Build Order (AI Studio Internal Sequence)

### Phase 1: Project Setup & Foundation

1. Initialize Vite + React + TypeScript project (`zenvo`)
2. Install all dependencies:
   - `tailwindcss`, `postcss`, `autoprefixer`
   - `@supabase/supabase-js`
   - `zustand`
   - `react-router-dom`
   - `react-hook-form`, `@hookform/resolvers`, `zod`
   - `lucide-react`
   - `shadcn/ui` components (button, input, select, dialog, toast, badge, card, table, dropdown-menu, avatar, separator, sheet, skeleton)
   - `clsx`, `tailwind-merge`
3. Configure `tailwind.config.ts` with custom colors (from Design Brief palette), Plus Jakarta Sans + Inter fonts
4. Set up `vite.config.ts` with proper SPA settings
5. Create `.env.example`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. Create `.npmrc` with `legacy-peer-deps=true`
7. Create `public/_redirects` with `/* /index.html 200`
8. Set up `src/lib/supabaseClient.ts` using env vars
9. Set up all TypeScript interfaces in `src/types/index.ts`:
   - `Profile`, `SellerProfile`, `Category`, `Product`, `ProductImage`
   - `Order`, `OrderItem`, `OrderStatusHistory`
   - `Coupon`, `CouponUsage`, `Wishlist`, `Address`, `Notification`
10. Set up all route constants in `src/constants/routes.ts`

---

### Phase 2: Auth & Store Setup

1. Create Zustand stores:
   - `authStore.ts`: `{ user, profile, session, setUser, setProfile, signOut }`
   - `cartStore.ts`: `{ items, addItem, removeItem, updateQty, clearCart, applyCoupon, removeCoupon }` — persist to localStorage
   - `wishlistStore.ts`: sync with Supabase wishlist table
2. Create `authService.ts`: signUp (with role), signInWithPassword, signInWithOAuth (Google), signOut, resetPassword, getCurrentUser
3. Create `ProtectedRoute.tsx`: check session → redirect /login if none
4. Create `RoleGuard.tsx`: check profile.role → redirect if wrong role
5. Build Auth Pages:
   - `LoginPage.tsx`: Email + Password form + Google OAuth button + "Signup" link
   - `SignupPage.tsx`: Name, email, password, role selector (Customer / Seller) + seller fields (store name, description, phone) shown conditionally
   - `ForgotPasswordPage.tsx`: email input, send reset link
6. Set up `App.tsx` with:
   - `supabase.auth.onAuthStateChange()` → fetch profile → set authStore
   - All routes with `<ProtectedRoute>` and `<RoleGuard>` wrappers
   - Suspense + lazy loading for all page components

---

### Phase 3: Layout & Design System

1. Create `Navbar.tsx`:
   - Logo (left), Search bar (center, expands on focus), Wishlist + Cart + Account icons (right)
   - Cart icon shows count badge (from cartStore)
   - Account: dropdown with role-based links (My Account / Seller Dashboard / Admin)
   - Mobile: hamburger → full-screen drawer menu
2. Create `Footer.tsx`: links, brand info, "Made in Pakistan" tagline
3. Create `AdminLayout.tsx`: fixed sidebar (240px) + content area; sidebar with all admin nav links, active state styling
4. Create `SellerLayout.tsx`: similar sidebar for seller nav
5. Create reusable common components:
   - `LoadingSpinner.tsx` and `PageSkeleton.tsx`
   - `EmptyState.tsx` (icon + message + action button)
   - `StatusBadge.tsx` (order statuses with colors)
   - `ConfirmModal.tsx` (generic confirmation dialog)
   - `ImageUpload.tsx` (drag-and-drop + click, uploads to Supabase Storage, returns URL)

---

### Phase 4: Public Pages (Customer Shopping)

1. **HomePage.tsx**:
   - Hero banner (full-width, gradient, headline + CTA buttons)
   - Featured Categories row (horizontal scroll on mobile, grid on desktop)
   - Featured Products section (grid of ProductCards)
   - Trending Products section (grid)
2. **ProductCard.tsx**: image, category tag, title (2-line clamp), seller name, price + compare price + discount %, Add to Cart button, Wishlist heart toggle
3. **ProductGrid.tsx**: responsive 2/3/4 column grid with skeleton loading
4. **ProductFilters.tsx**: category checkboxes, price range slider, in-stock toggle, sort dropdown — bottom sheet on mobile, sidebar on desktop
5. **ProductListPage.tsx**: filters + grid + pagination (20/page)
6. **SearchPage.tsx**: search results with query display, filters, empty state
7. **ProductDetailPage.tsx**:
   - Image gallery with thumbnail strip (main image + up to 5 thumbnails)
   - Product info: title, seller info, price, stock status badge, description
   - Quantity selector (max: min(10, stock))
   - Add to Cart + Wishlist buttons
   - Related products (same category, 4 cards)

---

### Phase 5: Cart & Checkout Flow

1. **CartPage.tsx**:
   - Cart items list with qty controls + remove button
   - Coupon code input: validate against Supabase coupons table, show discount
   - Order summary: subtotal, discount, total, "Cash on Delivery" payment display
   - "Checkout Karein" CTA → /checkout (or /login if not authenticated)
   - Empty state
2. **CheckoutPage.tsx**:
   - Two-step form: Address selection/entry → Order Review + Confirm
   - Saved addresses dropdown + "Add new address" option
   - Address form (React Hook Form + Zod validation)
   - COD payment summary
   - "Order Place Karein" button → calls `orderService.placeOrder()`:
     - Insert into `orders` (status='placed', snapshot shipping address)
     - Insert all `order_items` (with price snapshots)
     - Insert into `order_status_history`
     - Decrement stock (handled by DB trigger or in-app)
     - Insert coupon_usage if coupon applied
     - Increment coupon used_count
   - Success → redirect `/account/orders/:new_order_id`

---

### Phase 6: Customer Account Pages

1. **AccountPage.tsx** (tabs: Profile / Addresses):
   - Profile tab: editable name, phone; email read-only
   - Addresses tab: list of addresses, default indicator, add/edit/delete
2. **OrdersPage.tsx**: list of all orders with status badge, date, total, "Detail Dekhein" link
3. **OrderDetailPage.tsx**:
   - Order info header (number, date, total, payment)
   - Items list (with images)
   - Shipping address
   - Status Timeline component (OrderStatusTimeline.tsx)
   - Cancel order button (only if status is 'placed' or 'confirmed') with confirmation modal
4. **WishlistPage.tsx**: wishlist items grid, remove, "Cart Mein Daalein" per item

---

### Phase 7: Seller Dashboard & Management

1. **SellerDashboardPage.tsx**:
   - Stats cards: Products count, Orders count, Total Revenue (sum of order_items prices for this seller), Low Stock count
   - Low Stock Products list (stock <= low_stock_threshold)
   - Recent Orders table (last 5 orders containing seller's products)
2. **SellerProductsPage.tsx**:
   - Table: image thumbnail, title, category, price, stock, active toggle, edit/delete actions
   - Active/inactive toggle (in-line)
   - "Add Product" button → /seller/products/add
3. **SellerAddProductPage.tsx / SellerEditProductPage.tsx**:
   - Full form: title, description (textarea), category (dropdown), price, compare-at price, stock, low stock threshold
   - Image upload: `ImageUpload.tsx` component, up to 5 images, drag-to-reorder, shows preview
   - Active toggle
   - Zod validation on submit
   - On success: toast + redirect /seller/products
4. **SellerOrdersPage.tsx**:
   - Table: order number, customer (name only, no personal details beyond name), items (count), total, status, date, action
   - Status filter chips
   - Update status: dropdown per row (Placed→Confirmed, Confirmed→Shipped), confirm modal
   - Order detail modal (inline): items from this seller, shipping address

---

### Phase 8: Admin Panel

1. **AdminDashboardPage.tsx**:
   - 6 stats cards (Total Orders, Today Orders, Total Revenue, Products, Users, Sellers)
   - Pending Seller Applications alert banner (if any)
   - Low Stock Products alert (count + link)
   - Recent Orders table (last 10)
2. **AdminProductsPage.tsx**:
   - Full products table (all sellers) with: image, title, seller name, category, price, stock, status badges, approval status
   - Actions: Edit (inline modal), Approve/Reject, Suspend, Delete
   - Filters: Category dropdown, Seller dropdown, Status, Low Stock toggle
   - Bulk selection + bulk approve/delete
3. **AdminOrdersPage.tsx**:
   - All orders table with: order #, customer email, item count, total, status badge, date, actions
   - Status filter tabs (All / Placed / Confirmed / Shipped / Delivered / Cancelled)
   - Date range filter
   - Search by order ID or email
   - Update status per row (full status range)
   - Order detail modal
4. **AdminUsersPage.tsx**:
   - Customers table: name, email, joined, order count, status badge
   - Actions: View Orders, Suspend, Reactivate
5. **AdminSellersPage.tsx**:
   - Two sections: Pending Applications (with Approve/Reject) + Active Sellers
   - Seller info: store name, email, products count, joined, status
   - Actions: Approve, Reject, Suspend, Reactivate, View Products
6. **AdminCategoriesPage.tsx**:
   - Two-level category tree display
   - Add/Edit modal: name, slug (auto-generate), parent (optional), featured toggle
   - Delete (with check: no products assigned)
7. **AdminCouponsPage.tsx**:
   - Coupons table: code, type, value, min order, expiry, usage (X/max), active toggle, actions
   - Add/Edit modal: all coupon fields (code, type, value, min order, expiry, max uses, per-user limit, active)
   - Deactivate toggle in table row

---

### Phase 9: Services Layer (Supabase Operations)

All operations use `supabase` client from `supabaseClient.ts`. No hardcoded values.

1. **productService.ts**: getProducts (with filters/pagination), getProductById, getProductsBySeller, createProduct, updateProduct, deleteProduct (soft), toggleActive, approveProduct
2. **orderService.ts**: placeOrder (transaction: insert order + items + history + update coupon), getOrdersByCustomer, getOrdersBySeller, getOrderById, updateOrderStatus, cancelOrder
3. **couponService.ts**: validateCoupon (check active, expiry, min order, usage limits), applyCoupon (calculate discount), recordCouponUsage
4. **uploadService.ts**: uploadProductImage (to Supabase Storage, returns public URL), deleteProductImage, uploadSellerLogo
5. **categoryService.ts**: getCategories (with subcategories), getTopLevelCategories, createCategory, updateCategory, deleteCategory
6. **sellerService.ts**: getSellerProfile, updateSellerProfile, getSellerStats (products, orders, revenue), getSellerLowStockProducts
7. **adminService.ts**: getDashboardStats, approveSellerApplication, rejectSellerApplication, suspendUser, activateUser, getAllOrders (with filters), updateAnyOrderStatus, getAllProducts (admin view), approveProduct

---

### Phase 10: Polish & Quality

1. **Toast notifications** for all actions (add to cart, order placed, product saved, errors)
2. **Loading states**: Skeleton components for product grids, tables, dashboards
3. **Error boundaries**: Catch render errors, show friendly fallback
4. **Form validations**: All forms have Zod schemas, inline error messages
5. **Responsive review**: Check all pages at 375px, 768px, 1280px
6. **Empty states**: All list/table pages have illustrated empty states
7. **Page meta titles**: Each page has meaningful `<title>` + meta description (via document.title in useEffect)
8. **Accessibility**: Tab navigation, focus rings visible, ARIA labels on icon buttons
9. **404 page**: Clean "Page nahi mila" with Go Home button

---

## 3. File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Pages | PascalCase + Page suffix | `ProductDetailPage.tsx` |
| Components | PascalCase | `ProductCard.tsx` |
| Services | camelCase + Service suffix | `productService.ts` |
| Stores | camelCase + Store suffix | `cartStore.ts` |
| Hooks | camelCase + use prefix | `useProducts.ts` |
| Types | PascalCase interfaces | `Product`, `Order` |

---

## 4. Environment Variables Checklist

Before Cloudflare deployment, these must be set in Cloudflare Pages → Environment Variables:

| Variable | Required |
|----------|---------|
| `VITE_SUPABASE_URL` | ✅ YES |
| `VITE_SUPABASE_ANON_KEY` | ✅ YES |

---

## 5. Build & Deployment Checklist

- [ ] `package.json` build script: `"build": "vite build"`, output: `dist`
- [ ] `public/_redirects`: `/* /index.html 200`
- [ ] `.npmrc` in root: `legacy-peer-deps=true`
- [ ] `package-lock.json` committed (no `bun.lock` / `bun.lockb`)
- [ ] No hardcoded Supabase keys in any `.ts` or `.tsx` file
- [ ] All `VITE_` env vars documented in `.env.example`
- [ ] TypeScript: no `any` types (strict: false is ok for initial build)
- [ ] All routes work with SPA refresh (via `_redirects`)
- [ ] Google Fonts loaded via CSS link, not NPM package

---

## 6. Testing Checkpoints (AI Studio Internal QA)

After building, verify:
- [ ] Signup/Login works for all 3 roles
- [ ] Google OAuth redirect flow works
- [ ] Product list loads with filters
- [ ] Add to cart + quantity change + remove
- [ ] Coupon code apply (valid/invalid states)
- [ ] Checkout → order creation → redirect to order detail
- [ ] Order status timeline renders correctly
- [ ] Seller can add product with image upload (stub if Storage not connected)
- [ ] Admin dashboard stats render (may show 0 without real data)
- [ ] All protected routes redirect correctly without auth
- [ ] Mobile layout (375px): navbar, filters (bottom sheet), product grid (2 cols)
- [ ] No horizontal scroll on any page at 375px
- [ ] `npm run build` completes with no errors
