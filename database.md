# database.md — E-Commerce Database Schema

**Engine**: MySQL 8.0
**Charset**: utf8mb4
**Collation**: utf8mb4_unicode_ci

---

## Entity Relationship Overview

```
users ──────────────────────────────────────────────────────────────┐
  │                                                                  │
  ├──< addresses (user_id)                                          │
  │                                                                  │
  ├──< carts (user_id nullable)                                     │
  │       └──< cart_items (cart_id) >── products                   │
  │                                                                  │
  ├──< orders (user_id) >── addresses                              │
  │       ├──< order_items (order_id) >── products                 │
  │       └──< payments (order_id)                                  │
  │                                                                  │
  ├──< reviews (user_id) >── products                              │
  │                                                                  │
  └──< wishlist_items (user_id) >── products                       │

products ──────────────────────────────────────────────────────────┘
  ├── category_id → categories
  ├──< product_images (product_id)
  └──< product_variants (product_id)

categories
  └── parent_id → categories (self-referential)

coupons (standalone)
```

---

## Tables

### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| email_verified_at | TIMESTAMP | NULLABLE | |
| password | VARCHAR(255) | NOT NULL | bcrypt hashed |
| role | ENUM('customer','admin') | NOT NULL, DEFAULT 'customer' | |
| is_banned | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| remember_token | VARCHAR(100) | NULLABLE | |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `email` (unique)

---

### `categories`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| parent_id | BIGINT UNSIGNED | NULLABLE, FK → categories.id | Null = top-level |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | URL-safe identifier |
| image_path | VARCHAR(500) | NULLABLE | |
| sort_order | INT | NOT NULL, DEFAULT 0 | Display ordering |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `slug` (unique), `parent_id`

---

### `products`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| category_id | BIGINT UNSIGNED | NOT NULL, FK → categories.id | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | |
| description | TEXT | NULLABLE | |
| short_description | VARCHAR(500) | NULLABLE | Used in listing cards |
| price | DECIMAL(10,2) | NOT NULL | Regular price |
| sale_price | DECIMAL(10,2) | NULLABLE | Overrides price when set |
| stock | INT UNSIGNED | NOT NULL, DEFAULT 0 | Fallback if no variants |
| sku | VARCHAR(100) | NULLABLE, UNIQUE | |
| status | ENUM('active','inactive','draft') | NOT NULL, DEFAULT 'draft' | |
| is_featured | BOOLEAN | NOT NULL, DEFAULT FALSE | Homepage display |
| weight | DECIMAL(8,2) | NULLABLE | For shipping calc (kg) |
| views_count | INT UNSIGNED | NOT NULL, DEFAULT 0 | For popularity sort |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `slug` (unique), `category_id`, `status`, `is_featured`, `sale_price`

**Business Rules**:
- Effective price = `sale_price ?? price`
- If product has variants, stock is managed per variant; `products.stock` is ignored
- Soft deletes: deleted products still appear in historical orders

---

### `product_images`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| product_id | BIGINT UNSIGNED | NOT NULL, FK → products.id, CASCADE | |
| path | VARCHAR(500) | NOT NULL | Storage path |
| alt_text | VARCHAR(255) | NULLABLE | |
| is_primary | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| sort_order | INT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `product_id`, `(product_id, is_primary)`

**Business Rule**: Only one image per product can have `is_primary = true` (enforced at application layer)

---

### `product_variants`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| product_id | BIGINT UNSIGNED | NOT NULL, FK → products.id, CASCADE | |
| name | VARCHAR(255) | NOT NULL | e.g. "Red / XL" |
| sku | VARCHAR(100) | NULLABLE, UNIQUE | |
| price_modifier | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Added to base price |
| stock | INT UNSIGNED | NOT NULL, DEFAULT 0 | |
| sort_order | INT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `product_id`

---

### `addresses`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id, CASCADE | |
| label | VARCHAR(100) | NULLABLE | e.g. "Home", "Work" |
| full_name | VARCHAR(255) | NOT NULL | Recipient name |
| phone | VARCHAR(30) | NULLABLE | |
| line1 | VARCHAR(255) | NOT NULL | Street address |
| line2 | VARCHAR(255) | NULLABLE | Apt, suite, etc. |
| city | VARCHAR(100) | NOT NULL | |
| state | VARCHAR(100) | NOT NULL | |
| postal_code | VARCHAR(20) | NOT NULL | |
| country | CHAR(2) | NOT NULL | ISO 3166-1 alpha-2 |
| is_default | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `user_id`

---

### `carts`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NULLABLE, FK → users.id, CASCADE | Null = guest cart |
| session_id | VARCHAR(255) | NULLABLE | Guest identifier |
| coupon_id | BIGINT UNSIGNED | NULLABLE, FK → coupons.id | |
| expires_at | TIMESTAMP | NULLABLE | Guest carts expire after 7 days |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `user_id`, `session_id`

---

### `cart_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| cart_id | BIGINT UNSIGNED | NOT NULL, FK → carts.id, CASCADE | |
| product_id | BIGINT UNSIGNED | NOT NULL, FK → products.id | |
| variant_id | BIGINT UNSIGNED | NULLABLE, FK → product_variants.id | |
| quantity | INT UNSIGNED | NOT NULL, DEFAULT 1 | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `cart_id`, `(cart_id, product_id, variant_id)` unique

---

### `orders`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id | |
| address_id | BIGINT UNSIGNED | NULLABLE, FK → addresses.id | Snapshot below |
| status | ENUM('pending','processing','shipped','delivered','cancelled','refunded') | NOT NULL, DEFAULT 'pending' | |
| subtotal | DECIMAL(10,2) | NOT NULL | Before tax/shipping/discount |
| discount | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Coupon discount applied |
| tax | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | |
| shipping | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | |
| total | DECIMAL(10,2) | NOT NULL | Final charged amount |
| coupon_id | BIGINT UNSIGNED | NULLABLE, FK → coupons.id | |
| coupon_code | VARCHAR(50) | NULLABLE | Snapshot of code used |
| shipping_name | VARCHAR(255) | NULLABLE | Address snapshot |
| shipping_line1 | VARCHAR(255) | NULLABLE | |
| shipping_line2 | VARCHAR(255) | NULLABLE | |
| shipping_city | VARCHAR(100) | NULLABLE | |
| shipping_state | VARCHAR(100) | NULLABLE | |
| shipping_postal_code | VARCHAR(20) | NULLABLE | |
| shipping_country | CHAR(2) | NULLABLE | |
| notes | TEXT | NULLABLE | Customer order notes |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `user_id`, `status`, `created_at`

**Note**: Shipping address is snapshotted into the order columns — the customer's saved address may change later but the order must preserve what was used at time of purchase.

---

### `order_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | NOT NULL, FK → orders.id, CASCADE | |
| product_id | BIGINT UNSIGNED | NOT NULL, FK → products.id | |
| variant_id | BIGINT UNSIGNED | NULLABLE, FK → product_variants.id | |
| product_name | VARCHAR(255) | NOT NULL | Snapshot |
| variant_name | VARCHAR(255) | NULLABLE | Snapshot |
| unit_price | DECIMAL(10,2) | NOT NULL | Price at time of order |
| quantity | INT UNSIGNED | NOT NULL | |
| subtotal | DECIMAL(10,2) | NOT NULL | unit_price * quantity |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `order_id`, `product_id`

---

### `payments`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | NOT NULL, FK → orders.id | |
| provider | VARCHAR(50) | NOT NULL, DEFAULT 'stripe' | |
| provider_id | VARCHAR(255) | NOT NULL | Stripe PaymentIntent ID |
| status | ENUM('pending','succeeded','failed','refunded') | NOT NULL | |
| amount | DECIMAL(10,2) | NOT NULL | |
| currency | CHAR(3) | NOT NULL, DEFAULT 'USD' | |
| refunded_amount | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | |
| metadata | JSON | NULLABLE | Raw Stripe response |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `order_id`, `provider_id` (unique)

---

### `coupons`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| code | VARCHAR(50) | NOT NULL, UNIQUE | Case-insensitive in app layer |
| type | ENUM('percentage','fixed') | NOT NULL | |
| value | DECIMAL(10,2) | NOT NULL | % or fixed amount |
| min_order_amount | DECIMAL(10,2) | NULLABLE | Minimum cart subtotal |
| max_discount_amount | DECIMAL(10,2) | NULLABLE | Cap for percentage type |
| max_uses | INT UNSIGNED | NULLABLE | Null = unlimited |
| uses | INT UNSIGNED | NOT NULL, DEFAULT 0 | Atomically incremented |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| expires_at | TIMESTAMP | NULLABLE | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `code` (unique), `is_active`, `expires_at`

---

### `reviews`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id | |
| product_id | BIGINT UNSIGNED | NOT NULL, FK → products.id | |
| order_id | BIGINT UNSIGNED | NOT NULL, FK → orders.id | Verify purchase |
| rating | TINYINT UNSIGNED | NOT NULL | 1-5 |
| title | VARCHAR(255) | NULLABLE | |
| comment | TEXT | NULLABLE | |
| status | ENUM('pending','approved','rejected') | NOT NULL, DEFAULT 'pending' | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes**: `product_id`, `user_id`, `status`, `(user_id, product_id)` unique

---

### `wishlist_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id, CASCADE | |
| product_id | BIGINT UNSIGNED | NOT NULL, FK → products.id, CASCADE | |
| created_at | TIMESTAMP | NOT NULL | |

**Indexes**: `(user_id, product_id)` unique

---

### `personal_access_tokens` (Laravel Sanctum)

| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| tokenable_type | VARCHAR(255) | Polymorphic |
| tokenable_id | BIGINT UNSIGNED | |
| name | VARCHAR(255) | Token label |
| token | VARCHAR(64) | UNIQUE, hashed |
| abilities | TEXT | JSON array |
| last_used_at | TIMESTAMP | NULLABLE |
| expires_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

### `settings`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| key | VARCHAR(255) | NOT NULL, UNIQUE | |
| value | TEXT | NULLABLE | JSON or plain string |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Seeded keys**: `store_name`, `store_email`, `currency`, `tax_rate`, `low_stock_threshold`

---

## Migration Order

```
1.  users
2.  categories
3.  products
4.  product_images
5.  product_variants
6.  addresses
7.  coupons
8.  carts
9.  cart_items
10. orders
11. order_items
12. payments
13. reviews
14. wishlist_items
15. settings
16. personal_access_tokens (Sanctum — auto-created by package)
```

---

## Key Queries (Performance Reference)

```sql
-- Product listing with filters
SELECT p.*, pi.path as primary_image, AVG(r.rating) as avg_rating
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
WHERE p.status = 'active'
  AND p.deleted_at IS NULL
  AND p.category_id = ?
  AND (p.sale_price IS NOT NULL AND p.sale_price BETWEEN ? AND ?)
    OR (p.sale_price IS NULL AND p.price BETWEEN ? AND ?)
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 20 OFFSET ?;

-- Dashboard: today's revenue
SELECT SUM(total) FROM orders
WHERE DATE(created_at) = CURDATE()
  AND status NOT IN ('cancelled', 'refunded');

-- Low stock products
SELECT id, name, stock FROM products
WHERE status = 'active'
  AND stock <= (SELECT value FROM settings WHERE key = 'low_stock_threshold')
  AND deleted_at IS NULL;
```

---

## Indexes Summary

| Table | Index | Type | Reason |
|---|---|---|---|
| users | email | UNIQUE | Login lookup |
| products | slug | UNIQUE | URL routing |
| products | (status, deleted_at) | COMPOSITE | Listing queries |
| products | category_id | INDEX | Category filter |
| orders | user_id | INDEX | Customer order history |
| orders | status | INDEX | Admin order filter |
| orders | created_at | INDEX | Dashboard date queries |
| order_items | order_id | INDEX | Order detail |
| cart_items | cart_id | INDEX | Cart retrieval |
| reviews | (user_id, product_id) | UNIQUE | One review per purchase |
| coupons | code | UNIQUE | Coupon validation |
| personal_access_tokens | token | UNIQUE | Auth lookup |
