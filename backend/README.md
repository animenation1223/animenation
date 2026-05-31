# AnimeNation API

Express + TypeScript + Prisma + PostgreSQL backend.

## Setup

1. **PostgreSQL** (pick one):
   - Docker: `docker compose up -d` from repo root (uses `animenation:animenation@localhost:5432/animenation`)
   - Or install PostgreSQL locally and set `DATABASE_URL` in `backend/.env`

2. **Install & migrate**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # edit DATABASE_URL, JWT_SIGNING_SECRET, Google OIDC
   npx prisma migrate deploy
   npm run prisma:seed
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   API: http://localhost:4000 — health: `GET /healthz`

4. **Frontend** (from repo root)
   ```bash
   npm run dev
   ```
   Vite proxies `/api` and `/uploads` to port 4000.

## Auth

- **Google OIDC**: configure `GOOGLE_OIDC_*` in `.env`. Redirect URI must be `http://localhost:4000/api/auth/google/callback`.
- **Dev login** (non-production): `POST /api/auth/dev-login` with `{ "email": "you@example.com", "name": "Dev" }` — returns `access_token`.
- **Admin**: set `ADMIN_EMAIL` in `.env` to bootstrap admin role on first Google/dev login.

## REST surface

Entity routes mirror the former Base44 SDK (`/api/products`, `/api/cart-items`, etc.).  
Extras: `/api/coupons/validate`, `/api/banners`, `/api/pincode/:pincode`, `/api/loyalty/me`, `/api/newsletter`, `/api/uploads`.

## Razorpay payments

- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in `.env`.
- Authenticated checkout endpoints:
  - `POST /api/payments/razorpay/order` (create gateway order from current cart)
  - `POST /api/payments/razorpay/verify` (server-side signature + gateway verification, then creates app order)
  - `POST /api/payments/razorpay/failure` (record failed/cancelled attempt)
  - `POST /api/payments/razorpay/retry` (create a new gateway order)
- Webhook endpoint:
  - `POST /api/payments/razorpay/webhook` (raw-body signature verification)
