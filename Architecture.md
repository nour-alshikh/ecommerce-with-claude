# Architecture.md — E-Commerce Platform

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                                   │
│                                                                           │
│   ┌──────────────────────────┐    ┌──────────────────────────────────┐   │
│   │   Customer Storefront     │    │         Admin Panel               │   │
│   │  Next.js 15 (App Router)  │    │   Next.js 15 (App Router)        │   │
│   │                           │    │   /admin/* (middleware-guarded)   │   │
│   │  - Server Components      │    │   - DataTables, Forms, Charts     │   │
│   │  - TanStack Query (client)│    │   - TanStack Query mutations      │   │
│   │  - Zustand (cart/UI)      │    │                                   │   │
│   └──────────┬───────────────┘    └──────────────┬───────────────────┘   │
└──────────────┼──────────────────────────────────┼────────────────────────┘
               │  HTTP / REST (JSON)               │  HTTP / REST (JSON)
               │  Authorization: Bearer <token>    │  Authorization: Bearer <token>
               └────────────────┬─────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                        LARAVEL 12 API                                     │
│                    http://localhost:8000/api/v1                           │
│                                                                           │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Auth Routes  │  │  Shop Routes   │  │ Admin Routes  │  │ Webhooks  │  │
│  │  /auth/*      │  │  /products     │  │  /admin/*     │  │  /stripe  │  │
│  │               │  │  /cart         │  │               │  │           │  │
│  │  Sanctum      │  │  /orders       │  │  AdminOnly    │  │  Signed   │  │
│  │  Token Auth   │  │  /categories   │  │  Middleware   │  │  Secret   │  │
│  └──────────────┘  └────────────────┘  └──────────────┘  └───────────┘  │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        Service Layer                                │  │
│  │   CartService  │  PaymentService  │  InventoryService  │  CouponSvc │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     Laravel Queue (Redis)                           │  │
│  │   SendOrderEmail  │  UpdateInventory  │  ProcessRefund             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
               ┌─────────────────┼───────────────────┐
               │                 │                   │
     ┌─────────▼──────┐ ┌───────▼────────┐ ┌────────▼────────┐
     │   MySQL 8       │ │  File Storage  │ │  Redis (Queue)  │
     │  (primary DB)   │ │  S3 / local    │ │  + Cache        │
     └─────────────────┘ └────────────────┘ └─────────────────┘

External Services: Stripe, Mailgun
```

---

## 2. Frontend Architecture

### Route Groups

```
app/
├── (store)/                    # Customer-facing layout
│   ├── layout.tsx              # Header, Footer, CartDrawer
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Product listing (SSR + filters)
│   │   └── [slug]/
│   │       └── page.tsx        # Product detail (ISR, revalidate: 3600)
│   ├── categories/[slug]/
│   │   └── page.tsx            # Category page
│   ├── cart/
│   │   └── page.tsx            # Cart page
│   ├── checkout/
│   │   └── page.tsx            # Checkout (auth required)
│   ├── orders/
│   │   ├── page.tsx            # Order history
│   │   └── [id]/page.tsx       # Order detail
│   ├── profile/
│   │   └── page.tsx            # User account
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── search/
│       └── page.tsx
│
├── (admin)/                    # Admin layout
│   ├── layout.tsx              # Admin sidebar, header
│   └── admin/
│       ├── page.tsx            # Dashboard
│       ├── products/
│       │   ├── page.tsx        # Product list
│       │   ├── new/page.tsx    # Create product
│       │   └── [id]/page.tsx   # Edit product
│       ├── categories/
│       ├── orders/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── customers/
│       ├── coupons/
│       └── settings/
│
├── api/
│   └── auth/[...nextauth]/     # NextAuth.js handler
│
└── middleware.ts               # Route protection
```

### Rendering Strategy

| Route | Strategy | Reason |
|---|---|---|
| Homepage | SSR | Dynamic featured products |
| Product listing | SSR | Filters/search must be server-driven |
| Product detail | ISR (3600s) | SEO + high traffic, changes infrequently |
| Category pages | ISR (3600s) | SEO |
| Cart / Checkout | CSR (client) | Auth-required, personalized |
| Orders | SSR | Auth-required, always fresh |
| Admin pages | SSR | Auth-required, always fresh |

### State Management

```
Zustand Store (client-side only)
├── cartStore       → optimistic cart items, drawer open state
└── uiStore         → sidebar open, toast queue

TanStack Query (server sync)
├── useProducts     → paginated product list
├── useProduct      → single product
├── useCart         → server cart state
├── useOrders       → order list
└── useMutation     → cart updates, order creation

NextAuth Session
└── session.user.token  → Sanctum token passed to every API call
```

### API Client (`lib/api.ts`)

```typescript
// Axios instance — attaches token automatically
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use(config => {
  const token = getServerSession() ?? getCookie('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### Auth Flow

```
1. User submits login form
2. Next.js API route → POST /api/v1/auth/login (Laravel)
3. Laravel returns { token, user }
4. NextAuth stores token in encrypted server-side session (JWT)
5. All subsequent requests: session.user.token → Authorization header
6. On logout: DELETE /api/v1/auth/logout → invalidate Sanctum token
```

### Admin Route Protection (middleware.ts)

```typescript
export function middleware(request: NextRequest) {
  const session = getSession(request)

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect('/auth/login')
    }
  }

  if (PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
    if (!session) return NextResponse.redirect('/auth/login')
  }
}
```

---

## 3. Backend Architecture

### Directory Layout

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── Auth/
│   │   │   ├── LoginController.php
│   │   │   ├── RegisterController.php
│   │   │   └── ProfileController.php
│   │   ├── Shop/
│   │   │   ├── ProductController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── CartController.php
│   │   │   ├── OrderController.php
│   │   │   ├── ReviewController.php
│   │   │   └── CouponController.php
│   │   ├── Admin/
│   │   │   ├── AdminProductController.php
│   │   │   ├── AdminOrderController.php
│   │   │   ├── AdminCustomerController.php
│   │   │   ├── AdminCouponController.php
│   │   │   ├── AdminDashboardController.php
│   │   │   └── AdminSettingController.php
│   │   └── Webhook/
│   │       └── StripeWebhookController.php
│   ├── Middleware/
│   │   ├── AdminOnly.php
│   │   └── EnsureBanned.php
│   ├── Requests/
│   │   ├── LoginRequest.php
│   │   ├── RegisterRequest.php
│   │   ├── ProductRequest.php
│   │   └── OrderRequest.php
│   └── Resources/
│       ├── ProductResource.php
│       ├── ProductCollection.php
│       ├── OrderResource.php
│       ├── UserResource.php
│       └── CartResource.php
├── Models/
│   ├── User.php
│   ├── Product.php
│   ├── ProductImage.php
│   ├── ProductVariant.php
│   ├── Category.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── Cart.php
│   ├── CartItem.php
│   ├── Address.php
│   ├── Coupon.php
│   ├── Review.php
│   └── Payment.php
├── Services/
│   ├── CartService.php         → add, update, remove, merge, clear
│   ├── OrderService.php        → create from cart, status transitions
│   ├── PaymentService.php      → Stripe Payment Intent creation
│   ├── InventoryService.php    → stock checks, decrement, low-stock alerts
│   └── CouponService.php       → validate, apply, increment uses
└── Jobs/
    ├── SendOrderConfirmationEmail.php
    ├── SendOrderStatusUpdateEmail.php
    └── AlertLowStock.php
```

### Middleware Stack

```
All API routes:
  → api (throttle:api)
  → auth:sanctum (protected routes)
  → AdminOnly (admin routes)

Public routes (no auth):
  → GET /products, /categories, /products/{slug}
```

---

## 4. Full API Reference

### Authentication

```
POST   /api/v1/auth/register        Register new customer
POST   /api/v1/auth/login           Login → returns token
DELETE /api/v1/auth/logout          Invalidate token
GET    /api/v1/auth/me              Get authenticated user
PUT    /api/v1/auth/profile         Update profile
PUT    /api/v1/auth/password        Change password
POST   /api/v1/auth/forgot-password Send reset email
POST   /api/v1/auth/reset-password  Reset with token
```

### Shop — Products & Categories

```
GET    /api/v1/products             List products (paginated, filterable)
GET    /api/v1/products/{slug}      Single product detail
GET    /api/v1/categories           List all categories (tree)
GET    /api/v1/categories/{slug}    Category with products
GET    /api/v1/search?q=            Full-text search
```

### Shop — Cart

```
GET    /api/v1/cart                 Get current cart
POST   /api/v1/cart/items           Add item { product_id, variant_id, qty }
PATCH  /api/v1/cart/items/{id}      Update quantity { qty }
DELETE /api/v1/cart/items/{id}      Remove item
DELETE /api/v1/cart                 Clear cart
POST   /api/v1/cart/coupon          Apply coupon { code }
DELETE /api/v1/cart/coupon          Remove coupon
```

### Shop — Checkout & Orders

```
GET    /api/v1/addresses            List saved addresses (auth)
POST   /api/v1/addresses            Save new address
PUT    /api/v1/addresses/{id}       Update address
DELETE /api/v1/addresses/{id}       Delete address

POST   /api/v1/payments/intent      Create Stripe PaymentIntent
POST   /api/v1/webhooks/stripe      Stripe webhook handler (signed)

GET    /api/v1/orders               List own orders (auth)
GET    /api/v1/orders/{id}          Order detail (auth, owns order)
POST   /api/v1/orders/{id}/cancel   Cancel order (pending only)
```

### Shop — Reviews

```
GET    /api/v1/products/{id}/reviews    Product reviews
POST   /api/v1/products/{id}/reviews   Submit review (auth, purchased)
```

### Admin — Dashboard

```
GET    /api/v1/admin/stats              Revenue, orders, customers summary
GET    /api/v1/admin/stats/revenue      Revenue chart data (daily, 30 days)
GET    /api/v1/admin/stats/top-products Top selling products
```

### Admin — Products

```
GET    /api/v1/admin/products           List all products
POST   /api/v1/admin/products           Create product
GET    /api/v1/admin/products/{id}      Get product
PUT    /api/v1/admin/products/{id}      Update product
DELETE /api/v1/admin/products/{id}      Soft delete product
POST   /api/v1/admin/products/{id}/images        Upload images
DELETE /api/v1/admin/products/{id}/images/{imgId} Delete image
PATCH  /api/v1/admin/products/{id}/images/{imgId}/primary  Set primary
PATCH  /api/v1/admin/products/bulk-status         Bulk status update
```

### Admin — Categories

```
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PUT    /api/v1/admin/categories/{id}
DELETE /api/v1/admin/categories/{id}
```

### Admin — Orders

```
GET    /api/v1/admin/orders               List all orders (filterable)
GET    /api/v1/admin/orders/{id}          Order detail
PATCH  /api/v1/admin/orders/{id}/status   Update order status
POST   /api/v1/admin/orders/{id}/refund   Process Stripe refund
```

### Admin — Customers

```
GET    /api/v1/admin/customers             List customers
GET    /api/v1/admin/customers/{id}        Customer profile + orders
PATCH  /api/v1/admin/customers/{id}/ban    Ban customer
PATCH  /api/v1/admin/customers/{id}/unban  Unban customer
```

### Admin — Coupons

```
GET    /api/v1/admin/coupons
POST   /api/v1/admin/coupons
PUT    /api/v1/admin/coupons/{id}
DELETE /api/v1/admin/coupons/{id}
```

### Admin — Reviews

```
GET    /api/v1/admin/reviews               List pending reviews
PATCH  /api/v1/admin/reviews/{id}/approve
PATCH  /api/v1/admin/reviews/{id}/reject
```

### Admin — Settings

```
GET    /api/v1/admin/settings
PUT    /api/v1/admin/settings
```

---

## 5. Payment Flow

```
Customer                Next.js              Laravel               Stripe
    │                      │                     │                    │
    │── Click "Pay" ───────►│                     │                    │
    │                      │── POST /payments/intent ──────────────►  │
    │                      │                     │── createPaymentIntent
    │                      │                     │◄── { client_secret }
    │                      │◄── { client_secret } │                   │
    │◄── Stripe Elements ──│                     │                    │
    │── Enter card ─────────────────────────────────────────────────►│
    │                      │                     │◄── webhook: payment_intent.succeeded
    │                      │                     │── Create Order
    │                      │                     │── Decrement Stock
    │                      │                     │── Send Email (queue)
    │◄── Redirect /orders/[id] ─────────────────────────────────────│
```

---

## 6. Cart Merge Flow

```
Guest adds items → stored in DB carts table with session_id
User logs in → CartService::mergeGuestCart(session_id, user_id)
  → for each guest item:
    - if product already in user cart → increment qty
    - else → move item to user cart
  → delete guest cart
```

---

## 7. Security Measures

| Threat | Mitigation |
|---|---|
| SQL Injection | Eloquent ORM (parameterized queries) |
| XSS | React's JSX auto-escaping |
| CSRF | Sanctum token auth (stateless, no cookies on API) |
| Auth bypass | Admin middleware on both Next.js (middleware.ts) and Laravel (AdminOnly) |
| Payment tampering | Order created only in Stripe webhook, never on client success |
| Brute force | Rate limit: 5 login attempts/min per IP |
| Stripe webhook spoofing | Verify webhook signature with `STRIPE_WEBHOOK_SECRET` |
| Insecure file upload | Validate MIME type + file size in Laravel; store outside webroot |
| Mass assignment | Laravel `$fillable` on all models |
| Enumeration | Orders/addresses checked for ownership before returning |

---

## 8. Scalability Considerations

- All heavy operations (emails, inventory updates) run through Laravel Queue + Redis
- Product pages use ISR — static-like performance under load
- API is stateless (Sanctum tokens) — can scale horizontally behind a load balancer
- File uploads offloaded to S3 in production — no filesystem coupling
- Database indexed on high-query columns (see database.md)
