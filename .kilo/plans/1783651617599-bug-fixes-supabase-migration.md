# Bug Fix Plan: Supabase Migration Audit

## Goal
Eliminate all runtime crashes and TypeScript build errors introduced by the Supabase migration commit (`7bd8e02`), and harden auth/payment flows for production use.

## Context
The latest commit migrated from Prisma/SQLite + JWT to Supabase Auth + PostgreSQL. It introduced:
- 2 completely missing modules (`services/paystack.ts`, `lib/payment.ts`)
- A broken middleware auth call
- Missing dependencies
- Several Zod v4 API mismatches
- Multiple `never` type inference issues from Supabase generics
- Null-crash risks on optional fields

**Note:** The repo owner is rebuilding this app from scratch. This plan is saved as a reusable checklist for the new implementation.

---

## Task List

### 1. Create missing modules
- [x] `services/paystack.ts` — Paystack service class with `initializePayment`, `verifyPayment`, `verifyWebhookSignature`
- [x] `lib/payment.ts` — `validatePaymentAmount`, `nairaToKobo`, `koboToNaira`

### 2. Fix middleware auth
- [x] Replace `supabase.auth.admin.getUserById(token)` with `supabase.auth.getUser(token)`
  - NOTE: middleware now verifies the app's own HS256 JWT via `verifyToken()` from `@/lib/auth` (instead of `supabase.auth.getUser(token)`), because the codebase issues its own JWTs; `/api/sabis` + `/api/sabis/<id>` are public GET routes and `/api/health` was also made public.
- [x] Add `/api/sabis/` to public GET route prefixes

### 3. Restore dependencies in `package.json`
- [x] Add `jose`, `bcryptjs`, `@types/bcryptjs`, `@prisma/client`

### 4. Fix login/register responses
- [x] Import `generateToken` from `lib/auth`
- [x] Generate and return `{ user, token }` so client-side `lib/db.ts` can store it in `localStorage`

### 5. Fix Zod v4 API
- [x] Replace `error.errors[0].message` with `error.issues[0].message` in all catch blocks

### 6. Guard against null `skills`
- [x] Change `skills.split(',')` → `(skills || '').split(',')` in:
  - `app/api/auth/me/route.ts`
  - `app/api/sabis/route.ts`
  - `app/api/sabis/[id]/route.ts`
  - `app/api/admin/users/route.ts`

### 7. Add input validation
- [x] `app/api/jobs/route.ts` POST — use `CreateJobSchema`
- [x] `app/api/jobs/[id]/route.ts` PATCH — use `UpdateJobSchema`
- [x] `app/api/reviews/route.ts` POST — use `CreateReviewSchema`

### 8. Fix review rating calculation
- [x] Guard `reduce` with `allReviews.length > 0 ? ... : 0`

### 9. Fix Supabase type inference (`never` errors)
- [x] Define explicit result interfaces for payment/webhook queries
  - NOTE: the `never` inference was fixed by adding the missing `Relationships` metadata to `lib/database.types.ts` plus explicit local result interfaces in the payment/webhook routes.
- [x] Cast `.single()` results or use `.overrideTypes<>()` where inference fails

### 10. Fix implicit `any` types
- [x] Add explicit types to `.map()` callbacks in `admin/users`, `sabis`, `reviews`

### 11. Fix `auth/me` import
- [x] Change import from `@/lib/auth` to `@/lib/auth-helpers`

### 12. Fix `lib/payment.ts` validation
- [x] Remove bogus `amount < config.appUrl` check; validate against `NEXT_PUBLIC_MIN_PAYMENT` directly

### 13. Rename schema field
- [x] Change `scheduledDate` → `date` in `UpdateJobSchema` to match handler
  - NOTE: `scheduledDate` → `date` was renamed in BOTH `CreateJobSchema` and `UpdateJobSchema` (the plan said only `UpdateJobSchema`).

### 14. Fix `lib/supabase.ts` type safety
- [x] Cast `supabaseServiceKey as string` after null check in `getSupabaseAdmin()`

### 15. Fix `lib/auth.ts` JWT secret enforcement
- [x] Throw if `JWT_SECRET` is unset instead of using a hardcoded fallback

---

## Validation
1. `npm install` succeeds
2. `npx tsc --noEmit` returns zero errors
3. `npm run lint` returns zero errors
4. `/api/sabis` and `/api/sabis/[id]` return 200 without auth headers
5. `/api/auth/login` returns `{ user, token }`
6. Middleware rejects requests with missing/invalid Bearer tokens

---

## Risks / Notes
- Test Paystack keys in `.env.local` are sandbox-only; production keys must be set before launch
- Supabase service role key must be kept server-side only
- `@prisma/client` is still imported by legacy routes; remove after full migration if not needed

## Execution Result

Validation outcomes that actually ran:
- `npm install` OK
- `prisma generate` OK
- `npx tsc --noEmit` 0 errors
- `npm run lint` 0 errors
- `next build` OK
- Smoke tests: `/api/health` 200, `/api/sabis` 200, `/api/sabis/<id>` 404 (not 401), `/api/admin/users` 401 no-token, 401 invalid-token, `/api/jobs` 401

### Not runtime-validated
- Supabase-backed routes (auth/login, auth/register, auth/logout, payments/initialize, payments/verify, webhooks/paystack) and the live Paystack API — no Supabase credentials exist in this environment; they were type-checked, built and code-reviewed only.

### Follow-up: build no longer depends on environment variables

The Vercel preview build failed with "Failed to collect page data" because
`lib/supabase.ts` and `lib/config.ts` validated environment variables at module
scope, so importing them threw whenever the vars were absent. Both modules now
resolve lazily (first use), and `lib/config.ts` validates per property — only
`APP_URL` is required. Verified: `next build` succeeds with no Supabase vars,
with no APP_URL, and with dummy vars (18/18 static pages, exit 0).
