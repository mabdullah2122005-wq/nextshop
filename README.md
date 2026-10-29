# NextShop — Full-stack e-commerce on Next.js

A production-ready e-commerce starter: storefront, cart, Stripe checkout, customer accounts, and an admin panel with analytics — all in one Next.js 16 (App Router) codebase.

## Features

**Storefront**
- Home page with hero, categories and featured products
- Catalogue with search, category filter, price sort and pagination
- Product detail pages with SEO metadata / Open Graph images
- Persistent cart (works for guests, stored in the browser)
- Stripe Checkout (cards, Apple Pay / Google Pay, shipping address collection)
- Order confirmation page + confirmation email

**Accounts**
- Email/password registration and sign-in (Auth.js / NextAuth v5, bcrypt hashing)
- Customer order history
- Role-based access: `CUSTOMER` and `ADMIN`

**Admin panel** (`/admin`)
- Dashboard: revenue, paid orders, average order value, customers, 14-day revenue chart, top products, low-stock alerts
- Products: create, edit, hide, delete (products with order history are archived, never lost)
- Orders: filter by status, view shipping address, update status (emails the customer on ship/deliver)
- Users: list, promote/demote admins

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Route Handlers, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM 6 |
| Auth | Auth.js (NextAuth v5) — JWT sessions, credentials provider |
| Payments | Stripe Checkout + signed webhooks |
| Email | Resend (falls back to console logging when not configured) |
| Validation | Zod v4 on every API input |
| Hosting | Vercel (+ Neon/Supabase/Vercel Postgres) |
| CI | GitHub Actions: lint, typecheck, migrate, build, seed |

## Quick start

Requirements: Node.js 20.9+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env          # then fill in values (see below)
docker compose up -d          # optional: local Postgres on :5432
npx prisma migrate deploy     # create tables
npm run db:seed               # demo products + admin user
npm run dev                   # http://localhost:3000
```

Sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` and open `/admin`.

### Testing payments locally

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET and restart `npm run dev`
```

Use test card `4242 4242 4242 4242`, any future expiry, any CVC.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | `npx auth secret` |
| `AUTH_TRUST_HOST` | off-Vercel | `true` for self-hosting / local prod builds |
| `STRIPE_SECRET_KEY` | yes | `sk_test_…` / `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | yes | from Stripe webhook endpoint or `stripe listen` |
| `RESEND_API_KEY` | no | emails are logged to console when unset |
| `EMAIL_FROM` | no | verified sender, e.g. `Store <orders@yourdomain.com>` |
| `NEXT_PUBLIC_APP_URL` | yes in prod | used for Stripe redirect URLs |
| `NEXT_PUBLIC_STORE_NAME` | no | shown in header, footer, page titles |
| `NEXT_PUBLIC_CURRENCY` | no | ISO code, default `USD` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed only | first admin account |

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Create a Postgres database (Vercel Marketplace → Neon, or Supabase) and set `DATABASE_URL`.
3. Add all environment variables above in **Project → Settings → Environment Variables**.
4. Deploy. The `vercel-build` script runs `prisma migrate deploy` before `next build`, so schema changes ship automatically.
5. In Stripe → Developers → Webhooks, add endpoint `https://<your-domain>/api/webhooks/stripe` with events `checkout.session.completed` and `checkout.session.expired`; put its signing secret in `STRIPE_WEBHOOK_SECRET` and redeploy.
6. Seed the first admin once: `DATABASE_URL=<prod url> npm run db:seed` (change the password afterwards).

Every push to a branch gets a Vercel preview deployment; GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, migrations and a production build on each push/PR.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / server |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create a new migration after editing `schema.prisma` |
| `npm run db:seed` | Seed demo data + admin |
| `npm run db:studio` | Prisma Studio DB browser |

See [HANDOVER.md](HANDOVER.md) for architecture, API reference and maintenance notes.
