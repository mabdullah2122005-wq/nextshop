# Handover document

## 1. Architecture

```
Browser ──► Next.js (Vercel)
             ├─ Server Components (pages)  ──► Prisma ──► PostgreSQL
             ├─ Route Handlers /api/*      ──► Prisma, Stripe, Resend
             └─ proxy.ts (auth gate for /admin, /account)
Stripe ──webhook──► /api/webhooks/stripe
```

- **One codebase, one deploy.** Pages read the database directly in Server Components (fast, no extra hop). Mutations go through REST Route Handlers so the same API can serve a future mobile app.
- **PostgreSQL** was chosen over MongoDB because orders, items, products and users are relational and need transactions (payment → stock decrement).
- **Money is stored in integer cents** everywhere.
- **Order items snapshot name and price**, so editing or deleting a product never changes past orders.

## 2. Folder structure

```
prisma/
  schema.prisma        data model
  migrations/          SQL migrations (commit every change)
  seed.ts              demo data + first admin
src/
  auth.ts              Auth.js config (credentials, JWT, role in token)
  proxy.ts             route protection (Next 16 "proxy", formerly middleware)
  lib/
    prisma.ts          DB client singleton
    stripe.ts          lazy Stripe client
    email.ts           Resend templates (order confirmation, shipping, welcome)
    analytics.ts       dashboard aggregates
    validators.ts      Zod schemas for every API input
    api.ts             JSON error helpers + requireAdminApi()
    format.ts          price/date/id formatting
  components/          Header, Footer, CartProvider, ProductCard, …
  app/
    page.tsx           home
    products/          catalogue + [slug] detail
    cart/              cart + checkout button
    checkout/success/  confirmation
    login/ register/ account/
    admin/             dashboard, products, orders, users
    api/               REST endpoints (below)
```

## 3. Key flows

**Checkout**
1. Cart (localStorage) → `POST /api/checkout` with `{ productId, quantity }[]` only.
2. Server loads products from DB, checks `active` and stock, computes the total from DB prices, creates a `PENDING` order with item snapshots, and creates a Stripe Checkout Session (`metadata.orderId`).
3. Customer pays on Stripe → redirected to `/checkout/success`.
4. Stripe calls `POST /api/webhooks/stripe` (signature verified). In one transaction: `PENDING → PAID` (only if still pending, which makes it idempotent), save email and shipping address, and decrement stock. Then a confirmation email is sent.
5. Expired sessions mark the order `CANCELLED`.

> The webhook, not the redirect, is the source of truth for payment.

**Auth**: Credentials → bcrypt compare → JWT cookie containing `id` and `role`. `proxy.ts` redirects unauthenticated or non-admin users away from protected pages, and every admin page and API re-checks the role server-side.

## 4. API reference

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/products?q=&category=&page=` | public | list active products |
| GET | `/api/products/:slug` | public | product detail |
| POST | `/api/register` | public | create customer `{name,email,password}` |
| GET/POST | `/api/auth/*` | — | Auth.js (sign-in, session, csrf) |
| POST | `/api/checkout` | public / customer | create order + Stripe session → `{url}` |
| POST | `/api/webhooks/stripe` | Stripe signature | payment events |
| POST | `/api/coupons` | public | preview a discount code `{code, subtotalCents}` |
| GET/POST | `/api/products/:slug/reviews` | public / customer | list / create-or-update own review |
| GET/POST | `/api/wishlist` | customer | list ids / toggle `{productId}` |
| POST | `/api/newsletter` | public | subscribe `{email}` |
| POST | `/api/auth/forgot` | public | email a reset link `{email}` |
| POST | `/api/auth/reset` | public | set password `{token, password}` |
| GET | `/api/admin/stats` | admin | dashboard metrics |
| GET/POST | `/api/admin/coupons` | admin | list / create discount codes |
| PATCH/DELETE | `/api/admin/coupons/:id` | admin | enable-disable / delete |
| GET/POST | `/api/admin/products` | admin | list / create |
| PATCH/DELETE | `/api/admin/products/:id` | admin | update / delete-or-archive |
| GET | `/api/admin/orders?status=` | admin | list orders |
| PATCH | `/api/admin/orders/:id` | admin | `{status}` |
| GET | `/api/admin/users` | admin | list users |
| PATCH | `/api/admin/users/:id` | admin | `{role}` |

Errors are always `{ "error": "message" }` with 401/403/404/409/422/502 status codes.

## 5. Common tasks

- **Change branding**: edit color tokens in `src/app/globals.css` (`--color-brand`, `--color-accent`) and set `NEXT_PUBLIC_STORE_NAME`.
- **Add a DB field**: edit `prisma/schema.prisma` → `npm run db:migrate -- --name add_field` → commit the migration. Vercel applies it on the next deploy.
- **Add an admin**: `/admin/users` → set role to ADMIN.
- **Add shipping countries**: `allowed_countries` in `src/app/api/checkout/route.ts`.
- **Add Google sign-in**: add `Google` to `providers` in `src/auth.ts` and set `AUTH_GOOGLE_ID/SECRET`.
- **Go live with Stripe**: swap in `sk_live_…`, create a live webhook endpoint, and update `STRIPE_WEBHOOK_SECRET`.

## 6. Security notes

- Prices and stock are validated server-side; client-sent prices are never used.
- Webhook signatures are verified; webhook handling is idempotent.
- Passwords are hashed with bcrypt (cost 12); hashes are never returned by any API.
- All inputs are validated with Zod; admins cannot change their own role.
- Before launch, restrict `images.remotePatterns` in `next.config.ts` to your real image hosts.

## 7. Verified

An end-to-end test was run against a real PostgreSQL database and a production build. All 70 checks passed. It covered:
- the catalogue, search and filters (including sale)
- registration, login and password reset (including single-use tokens)
- role protection (401/403/redirects)
- checkout validation, server-side pricing and discount codes
- a signed Stripe webhook: paid status, address, stock decrement, coupon usage, idempotency
- reviews and rating recalculation, the wishlist, and the newsletter
- order history
- admin CRUD for products, orders, users and discount codes

## 8. Suggested next steps

- Product image upload (Vercel Blob or Cloudinary) instead of URLs
- Multiple images and variants (size/colour) per product
- Shipping rates via Stripe `shipping_options` or a carrier API (Shippo/EasyPost)
- Rate limiting on `/api/register` and sign-in (e.g. Upstash)
- Vercel Analytics / GA4
