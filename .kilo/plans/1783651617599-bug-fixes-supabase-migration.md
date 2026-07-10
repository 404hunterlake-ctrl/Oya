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
- [ ] `services/paystack.ts` — Paystack service class with `initializePayment`, `verifyPayment`, `verifyWebhookSignature`
- [ ] `lib/payment.ts` — `validatePaymentAmount`, `nairaToKobo`, `koboToNaira`

### 2. Fix middleware auth
- [ ] Replace `supabase.auth.admin.getUserById(token)` with `supabase.auth.getUser(token)`
- [ ] Add `/api/sabis/` to public GET route prefixes

### 3. Restore dependencies in `package.json`
- [ ] Add `jose`, `bcryptjs`, `@types/bcryptjs`, `@prisma/client`

### 4. Fix login/register responses
- [ ] Import `generateToken` from `lib/auth`
- [ ] Generate and return `{ user, token }` so client-side `lib/db.ts` can store it in `localStorage`

### 5. Fix Zod v4 API
- [ ] Replace `error.errors[0].message` with `error.issues[0].message` in all catch blocks

### 6. Guard against null `skills`
- [ ] Change `skills.split(',')` → `(skills || '').split(',')` in:
  - `app/api/auth/me/route.ts`
  - `app/api/sabis/route.ts`
  - `app/api/sabis/[id]/route.ts`
  - `app/api/admin/users/route.ts`

### 7. Add input validation
- [ ] `app/api/jobs/route.ts` POST — use `CreateJobSchema`
- [ ] `app/api/jobs/[id]/route.ts` PATCH — use `UpdateJobSchema`
- [ ] `app/api/reviews/route.ts` POST — use `CreateReviewSchema`

### 8. Fix review rating calculation
- [ ] Guard `reduce` with `allReviews.length > 0 ? ... : 0`

### 9. Fix Supabase type inference (`never` errors)
- [ ] Define explicit result interfaces for payment/webhook queries
- [ ] Cast `.single()` results or use `.overrideTypes<>()` where inference fails

### 10. Fix implicit `any` types
- [ ] Add explicit types to `.map()` callbacks in `admin/users`, `sabis`, `reviews`

### 11. Fix `auth/me` import
- [ ] Change import from `@/lib/auth` to `@/lib/auth-helpers`

### 12. Fix `lib/payment.ts` validation
- [ ] Remove bogus `amount < config.appUrl` check; validate against `NEXT_PUBLIC_MIN_PAYMENT` directly

### 13. Rename schema field
- [ ] Change `scheduledDate` → `date` in `UpdateJobSchema` to match handler

### 14. Fix `lib/supabase.ts` type safety
- [ ] Cast `supabaseServiceKey as string` after null check in `getSupabaseAdmin()`

### 15. Fix `lib/auth.ts` JWT secret enforcement
- [ ] Throw if `JWT_SECRET` is unset instead of using a hardcoded fallback

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
