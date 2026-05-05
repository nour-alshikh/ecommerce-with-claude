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
- [x] Write tests: 10/10 passing (register, login, logout, me, admin guard, banned user)

### Frontend (Next.js)
- [x] Create Next.js 15 project in `./frontend/` (App Router, TypeScript, Tailwind)
- [x] Install packages: `next-auth@beta`, `axios`, `@tanstack/react-query`, `zustand`
- [x] Create `lib/api.ts` — Axios instance with base URL + token interceptor
- [x] Configure NextAuth.js v5 (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`)
- [x] Implement credentials provider — hits Laravel login endpoint
- [x] Store Sanctum token in NextAuth JWT → session
- [x] Create `app/providers.tsx` — SessionProvider + QueryClientProvider
- [x] Update root `app/layout.tsx` to wrap with Providers
- [x] Create `middleware.ts` — protect `/admin/*` and auth-required routes
- [x] Build login page (`app/(store)/auth/login/page.tsx`)
- [x] Build register page (`app/(store)/auth/register/page.tsx`)
- [x] Create `Header` component with auth state (sign in/out, admin link)
- [x] Create store layout (`app/(store)/layout.tsx`) with Header + Footer
- [x] Create homepage placeholder (`app/(store)/page.tsx`)
- [x] Create `.env.local` with API URL and NextAuth config
- [ ] shadcn/ui init (`npx shadcn@latest init`) — deferred to Phase 2 when UI components needed

---

## Phase 2 — Product Catalog
*Goal: Admin can create products; customers can browse and search them*

### Backend (Laravel)
- [ ] Create migrations: `categories`, `products`, `product_images`, `product_variants`
- [ ] Create models: `Category`, `Product`, `ProductImage`, `ProductVariant`
- [ ] Set up model relationships (Category hasMany Products, etc.)
- [ ] Configure soft deletes on `Product`
- [ ] Create `CategoryController` (public) — GET /categories, GET /categories/{slug}
- [ ] Create `ProductController` (public) — GET /products, GET /products/{slug}
- [ ] Implement product filtering: category, price range, rating, status
- [ ] Implement product sorting: price, newest, popularity (views_count)
- [ ] Implement full-text search: `MATCH AGAINST` on name + description
- [ ] Create `ProductResource` and `ProductCollection`
- [ ] Create `CategoryResource`
- [ ] Implement `views_count` increment on product detail view
- [ ] Create `AdminProductController` — full CRUD + image upload + bulk status
- [ ] Create `AdminCategoryController` — CRUD with nested support
- [ ] Handle image upload: validate MIME/size, store in `storage/app/public/products/`
- [ ] Run `php artisan storage:link`
- [ ] Create `ProductRequest` and `CategoryRequest` form requests
- [ ] Seed: 3 categories, 20 sample products with images and variants
- [ ] Write tests: product listing filters, product detail, admin CRUD

### Frontend (Next.js)
- [ ] Initialize shadcn/ui
- [ ] Build product listing page with filter sidebar (`app/(store)/products/page.tsx`)
  - [ ] Category filter checkboxes
  - [ ] Price range slider
  - [ ] Sort dropdown
  - [ ] Pagination
- [ ] Build product detail page — ISR (`app/(store)/products/[slug]/page.tsx`)
  - [ ] Image gallery with primary + thumbnails
  - [ ] Variant selector (size/color buttons)
  - [ ] Price display (sale price priority)
  - [ ] Stock indicator
  - [ ] Add to cart button
- [ ] Build category page (`app/(store)/categories/[slug]/page.tsx`) — ISR
- [ ] Build search page (`app/(store)/search/page.tsx`) — SSR
- [ ] Build homepage (`app/(store)/page.tsx`) — featured products, categories
- [ ] Create `ProductCard` component (listing card)
- [ ] Create `ProductGrid` component
- [ ] Create `FilterSidebar` component
- [ ] Create `SortDropdown` component
- [ ] Admin: product list table with search/filter (`app/(admin)/admin/products/page.tsx`)
- [ ] Admin: create/edit product form with image upload
- [ ] Admin: category management page

---

## Phase 3 — Cart & Checkout
*Goal: Customer can add to cart, enter card details, and receive an order confirmation*

### Backend (Laravel)
- [ ] Create migrations: `carts`, `cart_items`, `addresses`, `coupons`, `orders`, `order_items`, `payments`
- [ ] Create models: `Cart`, `CartItem`, `Address`, `Coupon`, `Order`, `OrderItem`, `Payment`
- [ ] Create `CartService`:
  - [ ] `getOrCreateCart(userId, sessionId)` — find or make cart
  - [ ] `addItem(cart, productId, variantId, qty)` — with stock check
  - [ ] `updateItem(cartItem, qty)`
  - [ ] `removeItem(cartItem)`
  - [ ] `mergeGuestCart(sessionId, userId)`
  - [ ] `applyCoupon(cart, code)` — via CouponService
  - [ ] `clear(cart)`
- [ ] Create `CouponService` — validate code, check rules, calculate discount
- [ ] Create `CartController` — GET, POST, PATCH, DELETE items, coupon endpoints
- [ ] Create `AddressController` — CRUD for authenticated user addresses
- [ ] Create `PaymentService`:
  - [ ] `createPaymentIntent(order)` — Stripe Payment Intents
- [ ] Create `OrderService`:
  - [ ] `createFromCart(cart, addressId)` — build order + items snapshot
  - [ ] `confirmFromWebhook(paymentIntentId)` — called from webhook
  - [ ] `decrementStock(order)`
- [ ] Create `StripeWebhookController`:
  - [ ] Verify webhook signature
  - [ ] Handle `payment_intent.succeeded` → create order
  - [ ] Handle `charge.refunded`
- [ ] Create `SendOrderConfirmationEmail` job + Mailable
- [ ] Add `order.confirmed` listener → dispatch email job
- [ ] Create `CartResource`, `OrderResource`
- [ ] Implement order ownership check (user can only view own orders)
- [ ] Create `OrderController` — GET /orders, GET /orders/{id}, POST /orders/{id}/cancel
- [ ] Write tests: cart add/update/remove, merge, coupon, checkout flow, webhook

### Frontend (Next.js)
- [ ] Create `cartStore` (Zustand) — items, count, optimistic updates
- [ ] Create `useCart` hook (TanStack Query — server cart state)
- [ ] Create `CartDrawer` component (slide-in panel)
- [ ] Wire "Add to Cart" button on product detail → CartService mutation
- [ ] Build cart page (`app/(store)/cart/page.tsx`)
  - [ ] Item list with qty controls and remove
  - [ ] Coupon code input
  - [ ] Order summary (subtotal, discount, total)
  - [ ] "Proceed to Checkout" button
- [ ] Build checkout page (`app/(store)/checkout/page.tsx`) — auth-required
  - [ ] Step 1: Shipping address (new or saved)
  - [ ] Step 2: Order review
  - [ ] Step 3: Payment (Stripe Elements)
  - [ ] Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
  - [ ] Fetch PaymentIntent client_secret from API
  - [ ] Handle payment confirmation + redirect to /orders/[id]
- [ ] Build order confirmation page (`app/(store)/orders/[id]/page.tsx`)
- [ ] Build order history page (`app/(store)/orders/page.tsx`)
- [ ] Build profile + address management page (`app/(store)/profile/page.tsx`)

---

## Phase 4 — Admin Panel
*Goal: Admin can manage all store data through the dashboard*

### Backend (Laravel)
- [ ] Create `AdminDashboardController`:
  - [ ] GET /admin/stats — today/week/month revenue, order counts, new customers
  - [ ] GET /admin/stats/revenue — daily revenue for past 30 days
  - [ ] GET /admin/stats/top-products — top 5 by quantity sold
- [ ] Create `AdminOrderController`:
  - [ ] List orders (filter by status, date range, customer)
  - [ ] Order detail
  - [ ] PATCH status with validation (allowed transitions)
  - [ ] POST refund — via Stripe + update payment record
- [ ] Create `AdminCustomerController`:
  - [ ] List customers with order count + total spent
  - [ ] Customer detail + order history
  - [ ] Ban / unban
- [ ] Create `AdminCouponController` — CRUD + deactivate
- [ ] Create `AdminReviewController` — list pending, approve, reject
- [ ] Create `AdminSettingController` — GET + PUT settings key-value store
- [ ] Create `AlertLowStock` job — run daily, email admin list
- [ ] Write tests: admin endpoints return 403 to non-admins

### Frontend (Next.js)
- [ ] Build admin layout with sidebar navigation
- [ ] Build dashboard page (`app/(admin)/admin/page.tsx`)
  - [ ] Stats cards (revenue, orders, customers)
  - [ ] Revenue line chart (recharts or Chart.js)
  - [ ] Top products bar chart
  - [ ] Recent orders table
  - [ ] Low-stock alerts list
- [ ] Build admin orders page — DataTable with filters and status badge
- [ ] Build admin order detail page — items, customer info, status update
- [ ] Build admin customers page — table with search
- [ ] Build admin customer detail page — profile + order history
- [ ] Build admin coupons page — list + create/edit form
- [ ] Build admin reviews page — approve/reject pending reviews
- [ ] Build admin settings page — form for store config
- [ ] Create reusable `DataTable` component (sorting, pagination, search)
- [ ] Create reusable `StatsCard` component
- [ ] Create reusable `StatusBadge` component

---

## Phase 5 — Polish & Launch Prep
*Goal: Production-ready, SEO-optimized, fully tested*

### Features
- [ ] Product reviews — submit form, display on product detail, star rating UI
- [ ] Wishlist — add/remove, wishlist page
- [ ] Order status emails on status change (shipped, delivered)
- [ ] Password reset flow (forgot password → email → reset form)

### SEO & Performance
- [ ] Add `generateMetadata` to all public pages (title, description, OG tags)
- [ ] Add OG image for products using Next.js `opengraph-image.tsx`
- [ ] Generate `sitemap.xml` route (`app/sitemap.ts`)
- [ ] Generate `robots.txt` (`app/robots.ts`)
- [ ] Add JSON-LD structured data (Product schema) on product detail pages
- [ ] Verify ISR is working — check cache headers
- [ ] Add Next.js Image optimization to all product images

### Accessibility
- [ ] Keyboard navigation for modals, drawers, dropdowns
- [ ] ARIA labels on icon-only buttons
- [ ] Skip-to-content link
- [ ] Color contrast audit (WCAG AA)
- [ ] Focus trap in Cart Drawer and modals

### Error Handling & UX
- [ ] Global error boundary
- [ ] 404 page (`not-found.tsx`)
- [ ] Loading skeletons on product listing and detail
- [ ] Toast notifications (cart add, order placed, error)
- [ ] Empty states (no products, no orders, empty cart)
- [ ] Form validation feedback (inline errors)

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
- [ ] Create `.env.example` for both projects
- [ ] Write production `.env` values documentation
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
| Phase 2 — Product Catalog | Not Started | 0% |
| Phase 3 — Cart & Checkout | Not Started | 0% |
| Phase 4 — Admin Panel | Not Started | 0% |
| Phase 5 — Polish & Launch | Not Started | 0% |
