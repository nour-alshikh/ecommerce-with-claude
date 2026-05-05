# CLAUDE.md — E-Commerce Project

## Project Overview

Full-stack e-commerce platform with a customer-facing storefront and an admin panel.

- **Frontend**: Next.js 15 (App Router) — lives in `./frontend/`
- **Backend**: Laravel 12 REST API — lives in `./backend/`
- **Database**: MySQL 8
- **Payments**: Stripe (Payment Intents)
- **Auth**: Laravel Sanctum (tokens) + NextAuth.js v5 (session)

---

## Directory Structure

```
E-commerce-with-claude/
├── frontend/          # Next.js 15 app
│   ├── app/
│   │   ├── (store)/   # Customer storefront
│   │   └── (admin)/   # Admin panel
│   ├── components/
│   │   ├── store/
│   │   ├── admin/
│   │   └── ui/        # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts     # Axios client (points to Laravel)
│   │   ├── auth.ts    # NextAuth config
│   │   └── store/     # Zustand stores
│   └── ...
├── backend/           # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── Auth/
│   │   │   ├── Shop/
│   │   │   └── Admin/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Jobs/
│   ├── routes/api.php
│   └── ...
├── CLAUDE.md
├── PRD.md
├── Architecture.md
├── database.md
└── todo.md
```

---

## Development Commands

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve              # runs on http://localhost:8000
php artisan horizon            # queue worker (requires Redis)
php artisan storage:link       # public file access
```

### Frontend (Next.js)
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                    # runs on http://localhost:3000
npm run build
npm run lint
```

### Database
```bash
# Run migrations
php artisan migrate

# Fresh migration with seeds
php artisan migrate:fresh --seed

# Rollback last batch
php artisan migrate:rollback
```

---

## Environment Variables

### Backend `.env` (key values)
```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_DATABASE=ecommerce
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost

STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

FILESYSTEM_DISK=local    # swap to s3 in production
```

### Frontend `.env.local` (key values)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

---

## Coding Conventions

### Laravel
- Controllers are thin — delegate logic to `Services/`
- Always return API responses via `JsonResource` classes
- Use Form Requests for all validation
- Every model should have a corresponding Resource
- Admin routes are prefixed `/api/v1/admin/` and guarded by `AdminOnly` middleware
- Use queued jobs for all emails and heavy operations

### Next.js
- App Router only — no Pages Router
- Server Components by default; use `"use client"` only when needed (event handlers, hooks, browser APIs)
- Data fetching in Server Components goes directly via `lib/api.ts`
- Client-side mutations use TanStack Query `useMutation`
- Zustand only for UI state (cart drawer open, etc.) and optimistic cart items
- All API calls include the auth token from NextAuth session
- Admin routes live under `app/(admin)/admin/` and are protected by Next.js middleware

### General
- No inline styles — Tailwind only
- No `any` types in TypeScript
- Prefer named exports over default exports for components
- Keep components under 200 lines; split into sub-components when larger

---

## API Conventions

- Base URL: `/api/v1/`
- All responses: `{ data: ..., message: ..., meta: ... }` (Laravel Resources)
- Auth header: `Authorization: Bearer <sanctum_token>`
- Errors return standard HTTP codes: 401, 403, 404, 422, 500
- Pagination: `?page=1&per_page=20`
- Sorting: `?sort=price&direction=asc`
- Filtering: `?category=shoes&min_price=10&max_price=100`

---

## Role System

| Role | Access |
|---|---|
| `customer` | Storefront, own orders, own profile |
| `admin` | Everything including admin panel |

Role is stored on the `users.role` column (enum).

---

## Key Business Rules

1. Stock is decremented only after successful payment (webhook), not on cart add
2. Guest carts are session-based; merged into user cart on login
3. Orders are created inside the Stripe webhook handler — never trust client-side payment success
4. Product slugs must be unique and URL-safe
5. Soft deletes on Products and Users (never hard delete)
6. Sale price takes precedence over regular price when set and non-zero
7. Admin cannot delete an order — only change its status
8. Coupon `uses` counter is incremented atomically to prevent race conditions

---

## Testing

### Laravel
```bash
php artisan test                    # all tests
php artisan test --filter=CartTest  # specific test
```

### Next.js
```bash
npm run test         # Jest + React Testing Library
npm run test:e2e     # Playwright
```

---

## References

- [PRD.md](./PRD.md) — features and user stories
- [Architecture.md](./Architecture.md) — system design and API map
- [database.md](./database.md) — full schema reference
- [todo.md](./todo.md) — phased task list and progress
