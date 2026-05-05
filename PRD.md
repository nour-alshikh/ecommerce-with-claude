# PRD — E-Commerce Platform

**Version**: 1.0
**Date**: 2026-05-05
**Status**: In Progress

---

## 1. Executive Summary

A full-featured e-commerce platform serving two distinct user groups: **customers** who browse and purchase products, and **admins** who manage the store. The system is built with a decoupled architecture — a Next.js frontend consuming a Laravel REST API — allowing independent scaling and future mobile app support.

---

## 2. Goals

| Goal | Metric |
|---|---|
| Fast storefront | Product pages load under 1.5s (ISR) |
| Secure checkout | Stripe Payment Intents, webhook-confirmed orders |
| Full admin control | Admins can manage all store data without touching code |
| Mobile-friendly | Fully responsive on all screen sizes |
| SEO-ready | Dynamic OG tags, sitemap, structured data |

---

## 3. User Personas

### Customer (Guest)
- Can browse all products, categories, and search
- Can add to cart (session-persisted)
- Must register/login to complete checkout

### Customer (Authenticated)
- All guest capabilities
- Persistent cart (synced to account)
- Can checkout, view order history, track orders
- Can write product reviews (after purchase)
- Can manage saved addresses and profile

### Admin
- Full access to admin panel
- Can manage products, categories, orders, customers, coupons
- Can view sales reports and analytics
- Can configure store settings

---

## 4. Feature Requirements

### 4.1 Authentication

| ID | Feature | Priority |
|---|---|---|
| AUTH-01 | Customer registration (name, email, password) | P0 |
| AUTH-02 | Customer login with email/password | P0 |
| AUTH-03 | Logout and session invalidation | P0 |
| AUTH-04 | "Remember me" persistent session | P1 |
| AUTH-05 | Password reset via email | P1 |
| AUTH-06 | Admin login (same endpoint, role check) | P0 |
| AUTH-07 | Protected routes (customer + admin middleware) | P0 |

### 4.2 Product Catalog

| ID | Feature | Priority |
|---|---|---|
| CAT-01 | Browse all products (paginated, 20/page) | P0 |
| CAT-02 | Filter by category (single and multi) | P0 |
| CAT-03 | Filter by price range (min/max slider) | P0 |
| CAT-04 | Filter by rating | P1 |
| CAT-05 | Sort by: price asc/desc, newest, popularity | P0 |
| CAT-06 | Full-text search by name and description | P0 |
| CAT-07 | Product detail page (images, description, variants) | P0 |
| CAT-08 | Related products (same category) | P1 |
| CAT-09 | Product image gallery (multiple images, zoom) | P1 |
| CAT-10 | Stock availability indicator | P0 |
| CAT-11 | Sale price badge when discount active | P0 |
| CAT-12 | Breadcrumb navigation | P1 |
| CAT-13 | Category landing pages | P1 |

### 4.3 Cart

| ID | Feature | Priority |
|---|---|---|
| CART-01 | Add product to cart (with variant selection) | P0 |
| CART-02 | Update item quantity | P0 |
| CART-03 | Remove item from cart | P0 |
| CART-04 | Cart persists for guest (session cookie) | P0 |
| CART-05 | Guest cart merges into user cart on login | P0 |
| CART-06 | Cart drawer (slide-in from right) | P1 |
| CART-07 | Cart item count in header | P0 |
| CART-08 | Coupon code field and validation | P1 |
| CART-09 | Show subtotal, discount, and estimated total | P0 |

### 4.4 Checkout

| ID | Feature | Priority |
|---|---|---|
| CHK-01 | Shipping address form (new or saved) | P0 |
| CHK-02 | Shipping method selection | P1 |
| CHK-03 | Order summary review step | P0 |
| CHK-04 | Stripe card payment (Payment Intents) | P0 |
| CHK-05 | Order confirmation page after payment | P0 |
| CHK-06 | Order confirmation email to customer | P0 |
| CHK-07 | Coupon applied at checkout | P1 |
| CHK-08 | Tax calculation | P1 |

### 4.5 Orders

| ID | Feature | Priority |
|---|---|---|
| ORD-01 | Customer order history list | P0 |
| ORD-02 | Order detail page (items, status, address) | P0 |
| ORD-03 | Order status timeline (pending → shipped → delivered) | P1 |
| ORD-04 | Order cancellation (while pending) | P1 |

### 4.6 User Profile

| ID | Feature | Priority |
|---|---|---|
| USR-01 | View and edit profile (name, email, password) | P0 |
| USR-02 | Manage saved addresses (add, edit, delete, set default) | P0 |
| USR-03 | Wishlist (add/remove products) | P2 |

### 4.7 Reviews

| ID | Feature | Priority |
|---|---|---|
| REV-01 | Submit rating (1-5 stars) and comment | P1 |
| REV-02 | Only verified purchasers can review | P1 |
| REV-03 | Average rating displayed on product | P1 |
| REV-04 | Admin can approve or reject reviews | P1 |

### 4.8 Admin — Products

| ID | Feature | Priority |
|---|---|---|
| APR-01 | List all products (sortable, filterable, paginated) | P0 |
| APR-02 | Create product (name, slug, description, price, stock, category, status) | P0 |
| APR-03 | Edit product | P0 |
| APR-04 | Soft delete product | P0 |
| APR-05 | Upload multiple product images | P0 |
| APR-06 | Set primary image | P0 |
| APR-07 | Manage product variants (name, price modifier, stock) | P1 |
| APR-08 | Bulk status change (active/inactive) | P1 |
| APR-09 | Low-stock alert (configurable threshold) | P1 |

### 4.9 Admin — Categories

| ID | Feature | Priority |
|---|---|---|
| ACT-01 | List all categories | P0 |
| ACT-02 | Create / edit / delete category | P0 |
| ACT-03 | Nested categories (parent/child) | P1 |
| ACT-04 | Category image upload | P1 |

### 4.10 Admin — Orders

| ID | Feature | Priority |
|---|---|---|
| AOR-01 | List all orders (filter by status, date, customer) | P0 |
| AOR-02 | View order detail | P0 |
| AOR-03 | Update order status | P0 |
| AOR-04 | Trigger refund via Stripe | P1 |
| AOR-05 | Export orders to CSV | P2 |

### 4.11 Admin — Customers

| ID | Feature | Priority |
|---|---|---|
| ACU-01 | List all customers | P0 |
| ACU-02 | View customer profile and order history | P0 |
| ACU-03 | Ban / unban customer | P1 |

### 4.12 Admin — Coupons

| ID | Feature | Priority |
|---|---|---|
| CPN-01 | Create coupon (code, type: % or fixed, value, min order, expiry, max uses) | P0 |
| CPN-02 | List and manage coupons | P0 |
| CPN-03 | Deactivate coupon | P0 |

### 4.13 Admin — Dashboard & Reports

| ID | Feature | Priority |
|---|---|---|
| DSH-01 | Revenue summary (today, this week, this month) | P0 |
| DSH-02 | Recent orders table | P0 |
| DSH-03 | Low-stock product alerts | P0 |
| DSH-04 | New customers count | P1 |
| DSH-05 | Revenue over time chart (line chart, 30 days) | P1 |
| DSH-06 | Top-selling products chart | P1 |

### 4.14 Admin — Settings

| ID | Feature | Priority |
|---|---|---|
| SET-01 | Store name, contact email, currency | P0 |
| SET-02 | Tax rate configuration | P1 |
| SET-03 | Shipping zones and rates | P1 |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Product listing pages served via ISR (revalidate every 60 min) |
| Security | SQL injection prevention (Eloquent ORM), XSS prevention (React escaping), CSRF (Sanctum) |
| Security | Rate limiting on auth endpoints (5 attempts / minute) |
| Scalability | Stateless API — horizontal scaling ready |
| Accessibility | WCAG 2.1 AA compliance (keyboard nav, ARIA labels, contrast) |
| SEO | Meta titles, descriptions, OG tags per page; XML sitemap |
| Mobile | Responsive design — tested at 375px, 768px, 1280px, 1440px |

---

## 6. Out of Scope (v1.0)

- Multi-vendor marketplace
- Live chat / support tickets
- Loyalty points program
- Multi-language / i18n
- Mobile native apps
- Subscription / recurring billing
- Advanced analytics (cohort analysis, heatmaps)

---

## 7. Success Criteria

- All P0 features implemented and passing tests
- Checkout flow completes end-to-end with Stripe test cards
- Admin can create a product, and it appears on the storefront within 1 minute
- Order is created only after confirmed Stripe webhook — no orphaned orders
- No critical (P0) bugs in production at launch
