# AnimeNation India — Deployment Guide

> Production deployment for **Frontend (Vercel)**, **Backend (Railway)**, and **Database (Supabase PostgreSQL)**.

---

## Architecture Overview

```
┌──────────────────┐     HTTPS      ┌──────────────────┐     TCP/SSL     ┌──────────────────┐
│   Vercel (CDN)   │ ──────────────▶│   Railway (API)  │ ──────────────▶│ Supabase Postgres │
│   React SPA      │   /api proxy   │   Express + Node │   Prisma ORM   │   Managed DB      │
│   Static Assets  │                │   Port 4000      │                │   Connection Pool  │
└──────────────────┘                └──────────────────┘                └──────────────────┘
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (for local production testing)
- A [Vercel](https://vercel.com/) account (free tier works)
- A [Railway](https://railway.app/) account (Starter plan recommended)
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials
- A [Razorpay](https://razorpay.com/) account for payments

---

## Step 1 — Database (Supabase PostgreSQL)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) → **New Project**
2. Set a **strong database password** — save it securely
3. Choose a region close to your Railway deployment (e.g., `ap-south-1` for India)

### 1.2 Get Connection Strings

Navigate to **Project Settings → Database → Connection string**:

| Variable | Source | Example |
|----------|--------|---------|
| `DATABASE_URL` | Connection pooling (port `6543`) | `postgresql://postgres.[ref]:[pass]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection (port `5432`) | `postgresql://postgres.[ref]:[pass]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |

> [!IMPORTANT]
> You need **both** URLs. `DATABASE_URL` uses PgBouncer for connection pooling at runtime. `DIRECT_URL` is used by Prisma for migrations only.

### 1.3 Update Prisma Schema

In `backend/prisma/schema.prisma`, ensure your datasource block includes:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 1.4 Run Initial Migration

```bash
cd backend
DATABASE_URL="your_direct_url" npx prisma migrate deploy
DATABASE_URL="your_direct_url" npx prisma db seed
```

---

## Step 2 — Backend (Railway)

### 2.1 Create Railway Service

1. Go to [railway.app](https://railway.app/) → **New Project → Deploy from GitHub repo**
2. Select the `AnimeVerse` repository
3. Set the **Root Directory** to `backend`
4. Railway will auto-detect the `Dockerfile` and build the image

### 2.2 Configure Environment Variables

In Railway → your service → **Variables**, add all of these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `FRONTEND_BASE_URL` | `https://your-app.vercel.app` |
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `JWT_ISSUER` | `animenation` |
| `JWT_AUDIENCE` | `animenation-web` |
| `JWT_ACCESS_TOKEN_TTL_SECONDS` | `604800` |
| `JWT_SIGNING_SECRET` | `openssl rand -base64 32` output |
| `GOOGLE_OIDC_CLIENT_ID` | Google Cloud OAuth Client ID |
| `GOOGLE_OIDC_CLIENT_SECRET` | Google Cloud OAuth Client Secret |
| `GOOGLE_OIDC_REDIRECT_URI` | `https://your-backend.railway.app/api/auth/google/callback` |
| `ADMIN_EMAIL` | Your admin email |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret |

### 2.3 Configure Build & Start

Railway should auto-detect the Dockerfile. If configuring manually:

- **Build Command**: `npm ci && npx prisma generate && npm run build`
- **Start Command**: `npm run start:prod`

### 2.4 Configure Health Check

In Railway → service → **Settings → Health Check Path**: `/healthz`

### 2.5 Generate Public URL

Railway → service → **Settings → Networking → Generate Domain**

Copy the generated `*.railway.app` URL — you'll need it for Vercel and Google OAuth.

---

## Step 3 — Frontend (Vercel)

### 3.1 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) → **Add New Project → Import Git Repository**
2. Select the `AnimeVerse` repository
3. Set **Root Directory** to `.` (project root)
4. Framework preset: **Vite**

### 3.2 Configure Environment Variables

In Vercel → project → **Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay publishable key |

### 3.3 Configure API Proxy Rewrites

The `vercel.json` file already includes:
- SPA fallback rewrites (`/(.*)` → `/index.html`)
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- Immutable cache headers for hashed assets

> [!IMPORTANT]
> The frontend calls `/api/*` endpoints. In production, your frontend code must use the full backend URL. Update `src/api/httpClient.ts` to prepend `VITE_API_BASE_URL` if the API is on a different domain, OR configure Vercel rewrites to proxy `/api` to Railway.

To add API proxy via Vercel, add this to `vercel.json` rewrites:

```json
{
  "source": "/api/:path*",
  "destination": "https://your-backend.railway.app/api/:path*"
}
```

### 3.4 Update Google OAuth Redirect

In Google Cloud Console → Credentials → your OAuth Client:

- **Authorized JavaScript Origins**: `https://your-app.vercel.app`
- **Authorized Redirect URIs**: `https://your-backend.railway.app/api/auth/google/callback`

---

## Step 4 — Local Production Testing (Docker)

Test the full production stack locally before deploying:

```bash
# Create a .env file at the project root with required secrets
cp backend/.env.production.example .env

# Fill in the real values in .env, then:
docker compose -f docker-compose.prod.yml up --build

# Verify health:
curl http://localhost:4000/healthz
# Expected: {"ok":true,"uptime":...,"timestamp":"..."}
```

---

## Production Checklist

### Pre-Deployment

- [ ] Strong `JWT_SIGNING_SECRET` generated (`openssl rand -base64 32`)
- [ ] Supabase database created & connection strings obtained
- [ ] Google OAuth credentials configured with production redirect URIs
- [ ] Razorpay live mode keys obtained and webhook configured
- [ ] `FRONTEND_BASE_URL` set to actual Vercel domain
- [ ] `GOOGLE_OIDC_REDIRECT_URI` updated to Railway backend URL
- [ ] Prisma schema includes `directUrl` for Supabase pooling

### Backend (Railway)

- [ ] All environment variables set in Railway dashboard
- [ ] Health check path set to `/healthz`
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy on push enabled
- [ ] Initial database migration deployed (`prisma migrate deploy`)
- [ ] Database seeded (`prisma db seed`)
- [ ] Logs streaming — verify no startup errors

### Frontend (Vercel)

- [ ] `VITE_RAZORPAY_KEY_ID` set in Vercel env vars
- [ ] `vercel.json` present with SPA rewrites
- [ ] API proxy rewrite to Railway backend configured
- [ ] Custom domain configured (optional)
- [ ] Deployment preview tested on Vercel

### Post-Deployment Verification

- [ ] `GET /healthz` returns `{"ok": true}`
- [ ] Google OAuth login flow works end-to-end
- [ ] Products load on homepage
- [ ] Cart add/remove works
- [ ] Checkout + Razorpay payment flow works
- [ ] Admin dashboard accessible to admin email
- [ ] Mobile responsive UI verified
- [ ] HTTPS enforced on all endpoints

---

## Required Environment Variables — Complete Reference

### Backend (Railway / Docker)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | `development` | Set to `production` |
| `PORT` | ❌ | `4000` | Server listening port |
| `FRONTEND_BASE_URL` | ✅ | — | Vercel frontend URL (CORS origin) |
| `DATABASE_URL` | ✅ | — | Supabase pooled connection string |
| `DIRECT_URL` | ✅ | — | Supabase direct connection (migrations) |
| `JWT_SIGNING_SECRET` | ✅ | — | 256-bit secret for token signing |
| `JWT_ISSUER` | ❌ | `animenation` | JWT issuer claim |
| `JWT_AUDIENCE` | ❌ | `animenation-web` | JWT audience claim |
| `JWT_ACCESS_TOKEN_TTL_SECONDS` | ❌ | `604800` | Token expiry (default: 7 days) |
| `GOOGLE_OIDC_CLIENT_ID` | ✅ | — | Google OAuth client ID |
| `GOOGLE_OIDC_CLIENT_SECRET` | ✅ | — | Google OAuth client secret |
| `GOOGLE_OIDC_REDIRECT_URI` | ✅ | — | Google OAuth callback URL |
| `ADMIN_EMAIL` | ❌ | — | Auto-assigned admin role |
| `RAZORPAY_KEY_ID` | ✅ | — | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | ✅ | — | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | — | Razorpay webhook verification |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_RAZORPAY_KEY_ID` | ✅ | Razorpay publishable key for checkout |

---

## Useful Commands

```bash
# ── Backend ──────────────────────────────────────────────────────
cd backend

npm run build              # Compile TypeScript
npm run start              # Start production server
npm run start:prod         # Migrate DB + start server
npm run prisma:deploy      # Apply pending migrations (production)
npm run prisma:seed         # Seed database
npm run healthcheck        # Check if server is healthy

# ── Frontend ─────────────────────────────────────────────────────
cd ..  # project root

npm run build              # Vite production build
npm run preview            # Preview production build locally

# ── Docker ───────────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml up --build     # Full stack
docker compose -f docker-compose.prod.yml down            # Stop
docker compose -f docker-compose.prod.yml logs -f api     # Tail API logs
```
