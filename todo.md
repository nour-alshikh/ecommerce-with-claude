# todo.md — E-Commerce Build Checklist

**Legend**: `[ ]` = todo · `[x]` = done · `[-]` = skipped/deferred

---

## Phase 1 — Foundation & Auth
*Goal: Both apps running, talking to each other, auth working end-to-end*

### Backend (Laravel)
- [x] Create Laravel 12 project in `./backend/`
- [x] Configure `.env` (MySQL via XAMPP, APP_URL, SANCTUM_STATEFUL_DOMAINS)
- [x] Install packages: `laravel/sanctum`, `stripe/stripe-php`
- [x] Publish Sanctum via `vendor:publish`
- [x] Create `users` migration (add `role` enum, `is_banned`, `deleted_at`)
- [x] Create `User` model with `HasApiTokens`, `role`, `is_banned`, soft deletes
- [x] Create `LoginController` — POST /api/v1/auth/login
- [x] Create `RegisterController` — POST /api/v1/auth/register
- [x] Create `ProfileController` — GET /api/v1/auth/me, PUT /api/v1/auth/profile, PUT /api/v1/auth/password, DELETE /api/v1/auth/logout
- [x] Create `AdminOnly` middleware (check role = admin)
- [x] Create `EnsureNotBanned` middleware (return 403 if banned)
- [x] Set up `routes/api.php` with versioned prefix `/api/v1/`
- [x] Configure CORS (`config/cors.php`) to allow `localhost:3000`
- [x] Define named rate limiters (`api` 60/min, `auth` 5/min) in AppServiceProvider
- [x] Create `UserResource` for API response transform
- [x] Create `LoginRequest` and `RegisterRequest` form requests
- [x] Create `DatabaseSeeder` with admin + test customer
- [x] Run migrations against MySQL (`ecommerce` DB)
- [x] Run seeders (admin@ecommerce.local / password, customer@ecommerce.local / password)
- [x] Update `UserFactory` with `role` and `is_banned` fields
- [x] Write tests: 12/12 passing (register, login, logout, me, admin guard, banned user)

### Frontend (Next.js)
- [x] Create Next.js 16 project in `./frontend/` (App Router, TypeScript, Tailwind)
- [x] Install packages: `next-auth@beta`, `axios`, `@tanstack/react-query`, `zustand`
- [x] Create `lib/api.ts` — Axios instance with base URL + token interceptor
- [x] Configure NextAuth.js v5 (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`)
- [x] Implement credentials provider — hits Laravel login endpoint
- [x] Store Sanctum token in NextAuth JWT → session
- [x] Create `app/providers.tsx` — SessionProvider + QueryClientProvider
- [x] Update root `app/layout.tsx` to wrap with Providers
- [x] Create `proxy.ts` — protect `/admin/*` and auth-required routes (Next.js 16 convention)
- [x] Build login page (`app/(store)/auth/login/page.tsx`)
- [x] Build register page (`app/(store)/auth/register/page.tsx`)
- [x] Create `Header` component with auth state (sign in/out, admin link)
- [x] Create store layout (`app/(store)/layout.tsx`) with Header + Footer
- [x] Create homepage (`app/(store)/page.tsx`)
- [x] Create `.env.local` with API URL and NextAuth config

---

## Phase 2 — Product Catalog
*Goal: Admin can create products; customers can browse and search them*

### Backend (Laravel)
- [x] Create migrations: `categories`, `products`, `product_images`, `product_variants`
- [x] Create models: `Category`, `Product`, `ProductImage`, `ProductVariant`
- [x] Set up model relationships (Category hasMany Products, etc.)
- [x] Configure soft deletes on `Product`
- [x] Create `CategoryController` (public) — GET /categories, GET /categories/{slug}
- [x] Create `ProductController` (public) — GET /products, GET /products/{slug}
- [x] Implement product filtering: category, price range, status
- [x] Implement product sorting: price, newest, popularity (views_count)
- [x] Implement full-text search: `MATCH AGAINST` on name + description (LIKE fallback for SQLite/tests)
- [x] Create `ProductResource`, `CategoryResource`, `ProductImageResource`, `ProductVariantResource`
- [x] Implement `views_count` increment on product detail view
- [x] Create `AdminProductController` — full CRUD + image upload + bulk status
- [x] Create `AdminCategoryController` — CRUD
- [x] Handle image upload: validate MIME/size, store in `storage/app/public/products/`
- [x] Run `php artisan storage:link`
- [x] Create `ProductRequest`, `ProductFilterRequest`, `CategoryRequest` form requests
- [x] Seed: 3 categories, 20 sample products with variants
- [-] Write Phase 2 tests (deferred — auth tests still passing 12/12)

### Frontend (Next.js)
- [x] Create `lib/types.ts` — TypeScript interfaces (Product, Category, CartItem, etc.)
- [x] Extend `lib/api.ts` — server-side fetch helpers for RSC
- [x] Create `store/cartStore.ts` — Zustand cart with localStorage persistence
- [x] Build homepage (`app/(store)/page.tsx`) — hero, category grid, featured products (ISR 60s)
- [x] Build product listing page — SSR with filters (`app/(store)/products/page.tsx`)
  - [x] Category filter buttons
  - [x] Price range inputs
  - [x] Sort dropdown
  - [x] Pagination
- [x] Build product detail page — ISR 60s (`app/(store)/products/[slug]/page.tsx`)
  - [x] Image gallery with primary + thumbnails
  - [x] Variant selector (size/option buttons, out-of-stock disabled)
  - [x] Price display (sale price + discount %)
  - [x] Stock indicator
  - [x] Add to cart button with feedback
- [x] Create `ProductCard` component
- [x] Create `ProductGrid` component
- [x] Create `FilterSidebar` component (client, URL-driven)
- [x] Create `SortDropdown` component
- [x] Create `Pagination` component
- [x] Create `CartCount` badge on header cart icon
- [x] Admin: layout with sidebar (`app/(admin)/layout.tsx`)
- [x] Admin: dashboard page (`app/(admin)/admin/page.tsx`)
- [x] Admin: product list table with search/filter/delete (`app/(admin)/admin/products/page.tsx`)
- [x] Admin: create product form (`app/(admin)/admin/products/new/page.tsx`)
- [x] Admin: edit product form with image upload (`app/(admin)/admin/products/[id]/edit/page.tsx`)
- [x] Admin: category management page (`app/(admin)/admin/categories/page.tsx`)
- [x] Add `localhost:8000` to Next.js `images.remotePatterns`
- [x] Create `app/not-found.tsx` (404 page)

---

## Phase 3 — Cart & Checkout
*Goal: Customer can add to cart, enter card details, and receive an order confirmation*

### Backend (Laravel)
- [x] Create migrations: `carts`, `cart_items`, `addresses`, `coupons`, `orders`, `order_items`, `payments`
- [x] Create models: `Cart`, `CartItem`, `Address`, `Coupon`, `Order`, `OrderItem`, `Payment`
- [x] Create `CartService`:
  - [x] `getOrCreateCart(userId, sessionId)` — find or make cart
  - [x] `addItem(cart, productId, variantId, qty)` — with stock check
  - [x] `updateItem(cartItem, qty)`
  - [x] `removeItem(cartItem)`
  - [x] `mergeGuestCart(sessionId, userId)`
  - [x] `applyCoupon(cart, code)` — via CouponService
  - [x] `clear(cart)`
- [x] Create `CouponService` — validate code, check rules, calculate discount
- [x] Create `CartController` — GET, POST, PATCH, DELETE items, coupon endpoints
- [x] Create `AddressController` — CRUD for authenticated user addresses
- [x] Create `PaymentService`:
  - [x] `createPaymentIntent(order)` — Stripe Payment Intents
- [x] Create `OrderService`:
  - [x] `createFromCart(cart, addressId)` — build order + items snapshot
  - [x] `confirmFromWebhook(paymentIntentId)` — called from webhook
  - [x] `decrementStock(order)`
- [x] Create `StripeWebhookController`:
  - [x] Verify webhook signature
  - [x] Handle `payment_intent.succeeded` → confirm order
- [x] Create `SendOrderConfirmationEmail` job + Mailable
- [x] Create `CartResource`, `CartItemResource`, `OrderResource`, `OrderItemResource`, `AddressResource`
- [x] Implement order ownership check (user can only view own orders)
- [x] Create `OrderController` — GET /orders, GET /orders/{id}, POST /orders/{id}/cancel
- [-] Write tests: cart add/update/remove, merge, coupon, checkout flow, webhook (deferred)

### Frontend (Next.js)
- [x] Create `useCart` hook (TanStack Query — server cart state)
- [x] Create `CartDrawer` component (slide-in panel)
- [x] Wire "Add to Cart" button on product detail → CartService mutation
- [x] Build cart page (`app/(store)/cart/page.tsx`)
  - [x] Item list with qty controls and remove
  - [x] Coupon code input
  - [x] Order summary (subtotal, discount, total)
  - [x] "Proceed to Checkout" button
- [x] Build checkout page (`app/(store)/checkout/page.tsx`) — auth-required
  - [x] Step 1: Shipping address (new or saved)
  - [x] Step 2: Order review
  - [x] Step 3: Payment (Stripe Elements)
  - [x] Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
  - [x] Fetch PaymentIntent client_secret from API
  - [x] Handle payment confirmation + redirect to /orders/[id]
- [x] Build order confirmation page (`app/(store)/orders/[id]/page.tsx`)
- [x] Build order history page (`app/(store)/orders/page.tsx`)
- [x] Build profile + address management page (`app/(store)/profile/page.tsx`)

---

## Phase 4 — Admin Panel
*Goal: Admin can manage all store data through the dashboard*

### Backend (Laravel)
- [x] Create `AdminDashboardController`:
  - [x] GET /admin/stats — today/week/month revenue, order counts, new customers
  - [x] GET /admin/stats/revenue — daily revenue for past 30 days
  - [x] GET /admin/stats/top-products — top 5 by quantity sold
- [x] Create `AdminOrderController`:
  - [x] List orders (filter by status, date range, customer)
  - [x] Order detail
  - [x] PATCH status with validation (allowed transitions)
  - [x] POST refund — via Stripe + update payment record
- [x] Create `AdminCustomerController`:
  - [x] List customers with order count + total spent
  - [x] Customer detail + order history
  - [x] Ban / unban
- [x] Create `AdminCouponController` — CRUD + deactivate
- [x] Create `AdminReviewController` — list pending, approve, reject
- [x] Create `AdminSettingController` — GET + PUT settings key-value store
- [-] Create `AlertLowStock` job — run daily, email admin list (deferred to Phase 5)
- [-] Write tests: admin endpoints return 403 to non-admins (deferred to Phase 5)

### Frontend (Next.js)
- [x] Enhance admin dashboard with stats cards and charts
- [x] Build admin orders page — DataTable with filters and status badge
- [x] Build admin order detail page — items, customer info, status update
- [x] Build admin customers page — table with search
- [x] Build admin customer detail page — profile + order history
- [x] Build admin coupons page — list + create/edit form
- [x] Build admin reviews page — approve/reject pending reviews
- [x] Build admin settings page — form for store config
- [x] Create reusable `StatsCard` component
- [x] Create reusable `StatusBadge` component
- [-] Create reusable `DataTable` component (inline tables used instead)

---

## Phase 5 — Polish & Launch Prep
*Goal: Production-ready, SEO-optimized, fully tested*

### Features
- [x] Product reviews — submit form, display on product detail, star rating UI
  - [x] `ReviewController` (GET public reviews + POST auth-gated)
  - [x] `ReviewRequest`, `ReviewResource`
  - [x] `ReviewSection` component (star rating, review list, submit form)
  - [x] Verified-purchase check before allowing review submission
- [-] Wishlist — add/remove, wishlist page (deferred — P2 per PRD)
- [-] Order status emails on status change (deferred to notifications backlog)
- [x] Password reset flow (forgot password → email → reset form)
  - [x] `ForgotPasswordController`, `ResetPasswordController`
  - [x] `/auth/forgot-password` page, `/auth/reset-password` page
  - [x] `CanResetPassword` trait added to User model
  - [x] "Forgot password?" link on login form

### SEO & Performance
- [x] Add `generateMetadata` to all public pages (homepage, products listing, product detail)
- [-] OG image for products via `opengraph-image.tsx` (deferred — needs asset pipeline)
- [x] Generate `sitemap.xml` route (`app/sitemap.ts`)
- [x] Generate `robots.txt` (`app/robots.ts`)
- [x] Add JSON-LD structured data (Product schema) on product detail pages
- [-] Verify ISR cache headers (manual QA step)
- [x] Next.js Image optimization already applied (`<Image />` used throughout)

### Accessibility
- [-] Keyboard navigation for modals, drawers (deferred — needs focus-trap library)
- [-] ARIA labels on icon-only buttons (deferred — full audit)
- [x] Skip-to-content link (added to root layout)
- [-] Color contrast audit (deferred — design tool review)
- [-] Focus trap in Cart Drawer (deferred)

### Error Handling & UX
- [x] Global error boundary (`app/error.tsx`, `app/(store)/error.tsx`)
- [x] 404 page (`not-found.tsx`)
- [x] Loading skeletons on product listing (`app/(store)/products/loading.tsx`)
- [x] Toast notifications via `sonner` (cart add, review submit, password reset, errors)
- [x] Empty states (empty cart, empty orders — already in Phase 3/4 pages)
- [x] Form validation feedback (inline errors on all forms)

### Testing
- [ ] Backend: 80%+ test coverage on service layer
- [ ] Frontend: unit tests for CartStore, CouponService util
- [ ] E2E (Playwright): browse → add to cart → checkout → order confirmation
- [ ] E2E: admin creates product → appears on storefront
- [ ] Test with Stripe test cards: success, declined, 3DS

### Security Audit
- [ ] Verify all admin routes return 403 to non-admins
- [ ] Verify order ownership — user cannot view other users' orders
- [ ] Verify Stripe webhook signature check is enforced
- [ ] Review file upload: MIME type + size limits enforced
- [ ] Check all models have `$fillable` defined (no mass assignment)
- [ ] Run `php artisan route:list` — confirm no unintended public routes

### DevOps Prep
- [x] `.env.local.example` for frontend (updated with Stripe key)
- [x] `.env.example` for backend (already present with Stripe, DB, mail docs)
- [ ] Configure `FILESYSTEM_DISK=s3` for production
- [ ] Set up Laravel Horizon config for production queue
- [ ] Add `php artisan schedule:run` for `AlertLowStock` daily job
- [ ] Configure MySQL production user (no root)
- [ ] Review `config/cors.php` — lock to production domain only

---

## Backlog (Post v1.0)

- [ ] Multi-language support (i18n)
- [ ] CSV export for orders
- [ ] Advanced analytics (cohort, heatmaps)
- [ ] Subscription / recurring billing
- [ ] Multi-vendor marketplace
- [ ] Mobile app (React Native)
- [ ] Live order tracking with real carrier integration
- [ ] Loyalty points / referral system
- [ ] AI-powered product recommendations

---

## Progress Tracker

| Phase | Status | Completion |
|---|---|---|
| Phase 1 — Foundation & Auth | **Complete** | 100% |
| Phase 2 — Product Catalog | **Complete** | 100% |
| Phase 3 — Cart & Checkout | **Complete** | 100% |
| Phase 4 — Admin Panel | **Complete** | 100% |
| Phase 5 — Polish & Launch | In Progress | ~55% |
