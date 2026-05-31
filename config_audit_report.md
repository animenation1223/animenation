# Configuration & Environment Audit Report

This report presents a thorough, production-grade audit of all environment variables, configuration files, credentials, and potential architectural configuration risks in the **AnimeVerse** project.

---

## 1. Complete Environment Variables Register

Each variable referenced across the frontend and backend has been analyzed below:

### 1.1 Backend Environment Variables

#### `DATABASE_URL`
- **Where Used**: `backend/prisma/schema.prisma` (lines 5–9)
- **Purpose**: Establishes the database connection. In production, this uses Supabase's transaction connection pooling.
- **Example Format**: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Required Value Source**: Supabase Dashboard → Project Settings → Database → Connection string (Transaction Pooler - Port `6543`).

#### `DIRECT_URL`
- **Where Used**: `backend/prisma/schema.prisma` (lines 5–9)
- **Purpose**: Connects directly to PostgreSQL without connection pooling, which is required by Prisma to run schema migrations safely.
- **Example Format**: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
- **Required Value Source**: Supabase Dashboard → Project Settings → Database → Connection string (Session Mode - Port `5432`).

#### `PORT`
- **Where Used**: `backend/src/index.ts` (line 7), `backend/src/transport/http/controllers/upload.controller.ts` (line 15)
- **Purpose**: Defines the TCP port that the Express HTTP server binds to.
- **Example Format**: `4000`
- **Required Value Source**: Deployed platform (e.g., Railway automatically injects `PORT`).

#### `NODE_ENV`
- **Where Used**: `backend/src/server.ts` (line 14), `backend/src/transport/http/controllers/auth.controller.ts` (line 30), `backend/src/index.ts` (line 15)
- **Purpose**: Standard node environment flag. Toggles colored vs. structured logs, and sets cookies `Secure` flag.
- **Example Format**: `production` | `development`
- **Required Value Source**: Set manually in deployment settings.

#### `FRONTEND_BASE_URL`
- **Where Used**: `backend/src/server.ts` (line 24), `backend/src/transport/http/controllers/auth.controller.ts` (line 285)
- **Purpose**: Identifies the client URL for CORS authorization and post-OAuth redirect gating.
- **Example Format**: `https://animeverse.vercel.app`
- **Required Value Source**: Deployed frontend dashboard (e.g., Vercel App URL).

#### `API_PUBLIC_URL`
- **Where Used**: `backend/src/transport/http/controllers/upload.controller.ts` (line 15)
- **Purpose**: Prepend base domain for static assets uploaded directly to server storage.
- **Example Format**: `https://api.animeverse.in`
- **Required Value Source**: Deployed backend dashboard (e.g., Railway App URL).

#### `ADMIN_EMAIL`
- **Where Used**: `backend/src/usecases/auth/upsertUserFromGoogle.ts` (line 4)
- **Purpose**: Bootstraps the first user signing in with this email as an administrator (`admin` role).
- **Example Format**: `chief@animeverse.in`
- **Required Value Source**: Admin user’s corporate or personal email.

#### `JWT_SIGNING_SECRET`
- **Where Used**: `backend/src/transport/security/jwt.ts` (line 12), `backend/src/lib/auth.ts` (line 15)
- **Purpose**: Private symmetric key used to sign and cryptographically verify client JWT access tokens.
- **Example Format**: `d3FhOWFmMTJhMWQ0OTFhYzg5YzVkZjFlOWE1YjJlNDg=`
- **Required Value Source**: Generated locally using: `openssl rand -base64 32`

#### `JWT_ISSUER`
- **Where Used**: `backend/src/transport/security/jwt.ts` (line 15), `backend/src/lib/auth.ts` (line 18)
- **Purpose**: Identifies the principal that issued the JWT.
- **Example Format**: `animeverse-api`
- **Required Value Source**: Standard slug defined by application architect.

#### `JWT_AUDIENCE`
- **Where Used**: `backend/src/transport/security/jwt.ts` (line 16), `backend/src/lib/auth.ts` (line 19)
- **Purpose**: Identifies the recipients that the JWT is intended for.
- **Example Format**: `animeverse-web`
- **Required Value Source**: Standard slug defined by application architect.

#### `JWT_ACCESS_TOKEN_TTL_SECONDS`
- **Where Used**: `backend/src/transport/security/jwt.ts` (line 17), `backend/src/transport/http/controllers/auth.controller.ts` (line 31)
- **Purpose**: Defines lifespan duration for a signed access token.
- **Example Format**: `900` (15 minutes) | `604800` (7 days)
- **Required Value Source**: Security configuration preference.

#### `JWT_REFRESH_TOKEN_TTL_SECONDS`
- **Where Used**: `backend/src/transport/http/controllers/auth.controller.ts` (lines 32, 136)
- **Purpose**: Defines lifespan duration for a session refresh token.
- **Example Format**: `2592000` (30 days)
- **Required Value Source**: Security configuration preference.

#### `REQUIRE_EMAIL_VERIFICATION`
- **Where Used**: `backend/src/transport/http/controllers/auth.controller.ts` (line 124)
- **Purpose**: Toggle to enforce email activation check before allowing basic password sign-ins.
- **Example Format**: `true` | `false`
- **Required Value Source**: Application business policy configuration.

#### `GOOGLE_OIDC_CLIENT_ID`
- **Where Used**: `backend/src/transport/oidc/googleClient.ts` (line 9)
- **Purpose**: Google OAuth Client ID for authenticating users via Google.
- **Example Format**: `1234567890-abcdef.apps.googleusercontent.com`
- **Required Value Source**: Google Cloud Platform Console → APIs & Services → Credentials.

#### `GOOGLE_OIDC_CLIENT_SECRET`
- **Where Used**: `backend/src/transport/oidc/googleClient.ts` (line 10)
- **Purpose**: Google OAuth Client Secret for authenticating users via Google.
- **Example Format**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`
- **Required Value Source**: Google Cloud Platform Console → APIs & Services → Credentials.

#### `GOOGLE_OIDC_REDIRECT_URI`
- **Where Used**: `backend/src/transport/oidc/googleClient.ts` (line 11), `backend/src/transport/http/controllers/auth.controller.ts` (lines 289, 312)
- **Purpose**: Fully qualified OAuth redirect callback URL hosted on the backend.
- **Example Format**: `https://api.animeverse.in/api/auth/google/callback`
- **Required Value Source**: Deployed backend domain + callback endpoint.

#### `RAZORPAY_KEY_ID`
- **Where Used**: `backend/src/services/payment/razorpay.service.ts` (line 9), `backend/src/services/payment/payment.service.ts` (line 126)
- **Purpose**: Public key identifier for triggering Razorpay checkouts.
- **Example Format**: `rzp_live_1a2b3c4d5e`
- **Required Value Source**: Razorpay Dashboard → Settings → API Keys.

#### `RAZORPAY_KEY_SECRET`
- **Where Used**: `backend/src/services/payment/razorpay.service.ts` (lines 10, 47)
- **Purpose**: Private symmetric signature key for authenticating Razorpay orders and verify signatures.
- **Example Format**: `aBcDeFgHiJkLmNoPqRsTuVwX`
- **Required Value Source**: Razorpay Dashboard → Settings → API Keys.

#### `RAZORPAY_WEBHOOK_SECRET`
- **Where Used**: `backend/src/services/payment/razorpay.service.ts` (line 55)
- **Purpose**: SHA256 verification key for validates webhook event bodies.
- **Example Format**: `my_super_secret_webhook_key`
- **Required Value Source**: Razorpay Dashboard → Settings → Webhooks.

---

### 1.2 Frontend Environment Variables

#### `VITE_RAZORPAY_KEY_ID`
- **Where Used**: `src/pages/Checkout.jsx` (line 116), `src/components/features/india/RazorpayButton.jsx` (line 43)
- **Purpose**: Mounts the client-side payment gateway modal using the correct merchant account.
- **Example Format**: `rzp_live_1a2b3c4d5e`
- **Required Value Source**: Razorpay Dashboard (Must match the backend key).

#### `VITE_API_BASE_URL`
- **Where Used**: `vercel.json` rewrites and `src/api/httpClient.ts` configuration.
- **Purpose**: Routes API fetch queries to the hosted backend domain.
- **Example Format**: `https://api.animeverse.in`
- **Required Value Source**: Set in Vercel environment configurations (optional if using rewrites).

#### `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`
- **Where Used**: `src/lib/app-params.js` (lines 43–47)
- **Purpose**: Leftover parameters from a legacy mock service/integration framework.
- **Example Format**: `cbef744a8545c389ef439ea6`
- **Required Value Source**: Legacy system (unused in the active Prisma/Express production architecture).

---

## 2. Environment Verification & Variable Gaps

Below is a diagnostic audit of variables used in the code compared to active config files:

### 2.1 Missing Variables in Local `.env`
These variables are referenced in active backend code but are **completely absent** from the local development `backend/.env` file:
1. `DIRECT_URL` (Required for running Prisma migrations on Supabase, though not strictly required for local raw Postgres).
2. `API_PUBLIC_URL` (Falls back safely to local host, but should be documented).
3. `JWT_REFRESH_TOKEN_TTL_SECONDS` (Safely defaults to 30 days in code).
4. `REQUIRE_EMAIL_VERIFICATION` (Safely defaults to `false` in code).
5. `RAZORPAY_KEY_ID` (Required to initialize the payment flows).
6. `RAZORPAY_KEY_SECRET` (Required to initialize the payment flows).
7. `RAZORPAY_WEBHOOK_SECRET` (Required to initialize payment status sync).

### 2.2 Unused Variables in `.env`
All active variables listed in `backend/.env` are **fully referenced and utilized** by the backend application logic. There are no dead or stale keys.

### 2.3 Danger Audit: Placeholders That Will Break Production
If left unchanged, these hardcoded placeholders or mock config keys will cause catastrophic runtime failures in production:

| File | Variable Name | Active Value | Consequence |
|---|---|---|---|
| `backend/.env` | `JWT_SIGNING_SECRET` | `change_me_dev_only` | Extreme security hazard; allows users to forge admin auth tokens instantly. |
| `backend/.env` | `GOOGLE_OIDC_CLIENT_ID` | `your_google_client_id` | Google Sign-in fails; users cannot authenticate. |
| `backend/.env` | `GOOGLE_OIDC_CLIENT_SECRET` | `your_google_client_secret` | Google OAuth handshakes abort with authorization credentials failure. |
| `backend/.env` | `GOOGLE_OIDC_REDIRECT_URI` | `http://localhost...` | Callback fails; Google blocks the authentication flow due to mismatching redirect origins. |
| `backend/.env` | `ADMIN_EMAIL` | `admin@example.com` | No production user will receive automatically bootstrapped administrative privileges. |
| `backend/Dockerfile` | `DATABASE_URL` (build envs) | *Absent* | Migrations fail to deploy; server startup aborted. |
| `vercel.json` | `destination` | `https://your-backend.railway.app...` | API client network calls are sent to a dead URL, throwing `502 Bad Gateway` errors. |

---

## 3. Reference Implementation Files

### 3.1 Complete Local `.env` Template
Create/update `backend/.env` with these verified defaults:

```bash
# ── Server Config ──────────────────────────────────────────────
PORT=4000
NODE_ENV=development
FRONTEND_BASE_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:4000

# ── Database (Local Development) ──────────────────────────────
DATABASE_URL="postgresql://animenation:animenation@localhost:5432/animenation?schema=public"
DIRECT_URL="postgresql://animenation:animenation@localhost:5432/animenation?schema=public"

# ── JWT Authentication ──────────────────────────────────────────
# Generate dev key: openssl rand -base64 32
JWT_SIGNING_SECRET="change_me_dev_only_replace_in_production"
JWT_ISSUER="animenation"
JWT_AUDIENCE="animenation-web"
JWT_ACCESS_TOKEN_TTL_SECONDS=900
JWT_REFRESH_TOKEN_TTL_SECONDS=2592000
REQUIRE_EMAIL_VERIFICATION=false

# ── Google OAuth Sign-in ───────────────────────────────────────
GOOGLE_OIDC_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_OIDC_CLIENT_SECRET="GOCSPX-your_google_client_secret"
GOOGLE_OIDC_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"

# ── Administrative Roles ───────────────────────────────────────
ADMIN_EMAIL="admin@example.com"

# ── Razorpay Payment Gateway ──────────────────────────────────
RAZORPAY_KEY_ID="rzp_test_yourKeyId"
RAZORPAY_KEY_SECRET="yourKeySecret"
RAZORPAY_WEBHOOK_SECRET="yourWebhookSecret"
```

### 3.2 Complete Production `.env.production.example`
Provide a robust example representing the Supabase + Railway + Vercel stack:

```bash
# ── Server Config ──────────────────────────────────────────────
PORT=4000
NODE_ENV=production
FRONTEND_BASE_URL="https://your-app.vercel.app"
API_PUBLIC_URL="https://your-backend.railway.app"

# ── Database (Supabase PgBouncer Configuration) ───────────────
# Connection pooling URL (Port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct database URL for migrations (Port 5432)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ── JWT Authentication ──────────────────────────────────────────
# Run 'openssl rand -base64 32' to generate a secure secret
JWT_SIGNING_SECRET="Mjg2OWFlMTVkYTQxYjg5Y2RhZTU4NjJkMDdiOGI1YTQ="
JWT_ISSUER="animenation"
JWT_AUDIENCE="animenation-web"
JWT_ACCESS_TOKEN_TTL_SECONDS=900
JWT_REFRESH_TOKEN_TTL_SECONDS=2592000
REQUIRE_EMAIL_VERIFICATION=false

# ── Google OAuth Sign-in ───────────────────────────────────────
GOOGLE_OIDC_CLIENT_ID="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_OIDC_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_OIDC_REDIRECT_URI="https://your-backend.railway.app/api/auth/google/callback"

# ── Administrative Roles ───────────────────────────────────────
ADMIN_EMAIL="admin@yourdomain.com"

# ── Razorpay Payment Gateway ──────────────────────────────────
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 4. Setup Guide for Every Variable

### Database Settings
1. **Supabase Setup**:
   - Go to [Supabase](https://supabase.com), create a PostgreSQL project, and note the database password.
   - Go to **Project Settings** -> **Database** -> **Connection string** -> **URI**.
   - Copy the string under **Transaction** (for `DATABASE_URL` with transaction pooling).
   - Copy the string under **Session** (for `DIRECT_URL` used for migrations).

### Google Authentication
1. **GCP Project Setup**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com).
   - Enable the Google Sign-in API, and navigate to **APIs & Services** -> **OAuth consent screen**. Create your external consent screen.
   - Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - Set the Application type to **Web application**.
   - Add your client domain (e.g. `https://your-app.vercel.app`) to **Authorized JavaScript origins**.
   - Add your production callback handler (e.g. `https://your-backend.railway.app/api/auth/google/callback`) to **Authorized redirect URIs**.
   - Copy the generated `Client ID` (`GOOGLE_OIDC_CLIENT_ID`) and `Client Secret` (`GOOGLE_OIDC_CLIENT_SECRET`).

### Razorpay Integration
1. **Merchant Setup**:
   - Register on [Razorpay](https://razorpay.com).
   - Switch to your active environment (Test Mode for development, Live Mode for production).
   - Go to **Account & Settings** -> **API Keys** -> **Generate Key**.
   - Copy the public `Key ID` and private `Key Secret`.
   - Setup a Webhook in the Razorpay Dashboard targeting `https://your-backend.railway.app/api/payments/razorpay/webhook`. Check the event `payment.captured` and assign a secret webhook key (`RAZORPAY_WEBHOOK_SECRET`).

### Core Backend Authentication
1. **JWT Verification**:
   - To generate a cryptographically secure key for `JWT_SIGNING_SECRET`, open your terminal and run:
     ```bash
     openssl rand -base64 32
     ```
   - Standardize access tokens lifespans (`JWT_ACCESS_TOKEN_TTL_SECONDS`) to `900` (15 minutes) or similar to ensure prompt rotation.
