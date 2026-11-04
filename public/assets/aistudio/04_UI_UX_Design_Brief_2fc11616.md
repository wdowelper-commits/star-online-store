# 04_UI_UX_Design_Brief.md — UI/UX Design Brief
## Project: Zenvo — Multi-Vendor E-Commerce Marketplace

---

## 1. Design Philosophy

**Zenvo** ka design language: **Modern Minimal Commerce.** Clean whitespace, confident typography, and a bold primary color that signals trust and energy. Inspired by modern South Asian e-commerce but more refined — not cluttered, not over-decorated. Every element earns its place.

Guiding principles:
- **Clarity first:** Users should always know where they are and what to do next
- **Mobile-first:** 70%+ of South Asian e-commerce traffic is mobile
- **Speed perception:** Skeleton loaders, instant feedback, no "dead time"
- **Accessible:** WCAG AA contrast minimums everywhere

---

## 2. Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#6C47FF` | CTA buttons, links, active states, highlights |
| `primary-dark` | `#5535E8` | Button hover states |
| `primary-light` | `#EDE9FF` | Tag backgrounds, hover fills, soft highlights |
| `success` | `#16A34A` | In stock, order success, delivered status |
| `warning` | `#D97706` | Low stock, pending status |
| `danger` | `#DC2626` | Out of stock, cancelled, errors |
| `bg` | `#F8F8FC` | Page background |
| `surface` | `#FFFFFF` | Cards, modals, panels |
| `border` | `#E5E7EB` | Dividers, card borders |
| `text-primary` | `#111827` | Headings, body text |
| `text-muted` | `#6B7280` | Captions, helper text |
| `text-inverse` | `#FFFFFF` | Text on primary background |

**Dark mode:** Not required for v1. System default only.

---

## 3. Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| **Display / Hero** | `Plus Jakarta Sans` | 700 | 32–48px |
| **Headings** | `Plus Jakarta Sans` | 600 | 18–28px |
| **Body** | `Inter` | 400 | 14–16px |
| **UI Labels / Buttons** | `Inter` | 500–600 | 13–14px |
| **Prices / Numbers** | `Inter` tabular | 600–700 | varies |
| **Captions** | `Inter` | 400 | 12px |

- Load from Google Fonts: `Plus Jakarta Sans` (600, 700) + `Inter` (400, 500, 600)
- Base font size: 16px
- Line height body: 1.6
- Line height headings: 1.25

---

## 4. Layout

### Grid System
- Max content width: `1280px`, centered with `mx-auto`
- Side padding: `px-4` (mobile), `px-6` (tablet), `px-8` (desktop)
- Product grid: 2 columns mobile → 3 columns tablet → 4 columns desktop
- Admin/Seller panel: Fixed sidebar (240px) + fluid content area

### Spacing Scale (Tailwind defaults)
- Section gaps: `py-12` (mobile) / `py-16` (desktop)
- Card inner padding: `p-4` (mobile) / `p-5` (desktop)
- Component gap: `gap-4` to `gap-6`

### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px – 1024px`
- Desktop: `> 1024px`

---

## 5. Key Components

### 5.1 Product Card
```
┌─────────────────────────────┐
│  [Image]  [Heart icon]      │ ← aspect-ratio 4/3 or 1:1, object-cover
│  [Out of Stock badge if 0]  │
├─────────────────────────────┤
│  [Category tag — purple]    │
│  Product Title (2 lines max)│
│  [Store name — muted]       │
│  ₹1,299  ~~₹2,499~~  40%off│
│  [████ Add to Cart ████]    │ ← full width button
└─────────────────────────────┘
```
- Hover: slight scale up (scale-105), shadow deepens
- Low stock: yellow badge "Sirf 3 reh gaya!"
- Out of stock: greyed overlay, button disabled

### 5.2 Navbar
```
[Logo] ——— [Search Input (expanding)] ——— [Wishlist ♡] [Cart 🛒(3)] [Account ▾]
```
- Sticky on scroll with shadow
- Mobile: hamburger menu → slide-in drawer
- Search: expands inline on focus (desktop), full-screen on mobile
- Cart badge: animated count update

### 5.3 Buttons
| Variant | Style |
|---------|-------|
| Primary | `bg-primary text-white rounded-xl px-6 py-3 font-semibold hover:bg-primary-dark` |
| Secondary | `border border-primary text-primary bg-transparent hover:bg-primary-light` |
| Danger | `bg-danger text-white` |
| Ghost | `text-primary hover:bg-primary-light` |
| Disabled | `opacity-50 cursor-not-allowed` |

All buttons: `transition-all duration-150`, min 44px touch target on mobile.

### 5.4 Forms
- Input fields: `border border-border rounded-lg px-4 py-3`, focus ring in primary color
- Error state: red border + error message below field
- Labels: above field, `text-sm font-medium text-text-primary`
- Placeholder text: `text-text-muted`
- Required indicator: red asterisk `*`

### 5.5 Status Badges
```
Placed    → bg-blue-100   text-blue-700
Confirmed → bg-purple-100 text-purple-700
Shipped   → bg-orange-100 text-orange-700
Delivered → bg-green-100  text-green-700
Cancelled → bg-red-100    text-red-700
Pending   → bg-yellow-100 text-yellow-700
```

### 5.6 Order Status Timeline
```
● Order Placed — 2 Nov 2026 10:30 AM
│
● Confirmed — 2 Nov 2026 11:00 AM
│
○ Shipped
│
○ Delivered
```
- Filled circle = completed, Empty circle = pending
- Line between: green if done, gray if not

### 5.7 Admin/Seller Sidebar
- Fixed left, 240px wide on desktop
- Collapsed to icons only on mobile (bottom tab bar alternative)
- Active link: `bg-primary-light text-primary rounded-lg`
- Logo at top, user avatar + name at bottom

### 5.8 Data Tables (Admin)
- Striped rows (alternate `bg-white` / `bg-gray-50`)
- Sortable column headers
- Sticky header on scroll
- Row actions: icon buttons (edit ✏️, delete 🗑️, etc.) — visible on hover
- Pagination: "Previous / Next" with page numbers
- Mobile: horizontal scroll in `overflow-x-auto` container

### 5.9 Modals
- Centered overlay (`bg-black/50`)
- `rounded-2xl`, `shadow-xl`, max-width `lg`
- Close button top-right (X icon)
- Trap focus for accessibility
- `confirm` dialog: title + description + Cancel / Confirm (danger) buttons

### 5.10 Toast Notifications
- Bottom-center on mobile, top-right on desktop
- Auto-dismiss after 3 seconds
- Types: success (green), error (red), info (purple)

---

## 6. Responsive Behavior

| Element | Mobile | Desktop |
|---------|--------|---------|
| Product grid | 2 columns | 4 columns |
| Navbar | Hamburger + bottom cart icon | Full horizontal bar |
| Filters | Bottom sheet / slide-up | Left sidebar |
| Admin sidebar | Bottom nav or hamburger | Fixed left sidebar |
| Tables | Horizontal scroll | Full width |
| Cart | Full page | Page + sticky summary sidebar |
| Checkout | Stacked steps | Two-column (form + summary) |

---

## 7. Animations & Micro-interactions

- Page transitions: `fade in` (opacity 0→1, 150ms)
- Product card hover: `transform scale-105 shadow-lg` (100ms)
- Button click: `scale-95` (active state, 100ms)
- Cart icon: bounce when item added
- Toast: slide in from bottom/right (200ms)
- Loading skeleton: shimmer animation (`animate-pulse`)
- Status timeline: progressive fill animation on load
- Modal: `scale-95 opacity-0` → `scale-100 opacity-1` (150ms)
- Respect `prefers-reduced-motion`: disable all transforms/animations if set

---

## 8. Images & Icons

**Icons:**
- Library: `lucide-react` (clean, consistent line icons)
- Size: 20px for nav/UI, 16px for inline, 24px for feature icons

**Product Images:**
- Aspect ratio: 1:1 (square) for product cards
- `object-cover` with `object-center`
- Placeholder: subtle gray gradient with Zenvo logo watermark or `bg-gray-100` + camera icon

**No stock photo backgrounds.** Clean white or `bg-gray-50` surfaces.

---

## 9. Accessibility

- All interactive elements have `:focus-visible` ring (2px primary color)
- Color contrast: minimum 4.5:1 for body text
- Images have `alt` attributes (product name)
- Form inputs have associated `<label>`
- Modals trap focus and return focus on close
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`
- ARIA roles where needed (`role="dialog"`, `aria-label`)
- Mobile touch targets: minimum 44×44px

---

## 10. Empty & Error States Design

| State | Content |
|-------|---------|
| Empty cart | Shopping bag illustration + "Cart khali hai" + "Products Dekhein" button |
| Empty wishlist | Heart illustration + "Koi saved item nahi" + "Browse karein" button |
| No products found | Search/filter illustration + "Koi product nahi mila" + "Filters Clear Karein" |
| No orders yet | Package illustration + "Koi order nahi" + "Shopping Shuru Karein" |
| 404 page | Friendly "Ye page nahi mila" + Go Home button |
| Server error | "Kuch gadbad hui" + Retry button |

All empty states use consistent illustration style (simple line art, primary color accent).
