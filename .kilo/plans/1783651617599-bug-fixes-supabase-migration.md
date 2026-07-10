# Bug Fix Plan: Oya Marketplace Supabase Migration

## Context
Latest commit `7bd8e02` ("feat: Complete migration to Supabase + fix all security audit issues") introduced multiple runtime and type errors. This plan documents all fixes applied so far and the remaining work.

---

## Bugs Found and Fixed

### 1. Missing `services/paystack.ts` and `lib/payment.ts` (CRITICAL)
**Problem:** Payment API routes import from `@/services/paystack` and `@/lib/payment`, but these files do not exist.
**Fix:** Create both files with full Paystack service implementation and payment utility functions.

### 2. Middleware auth uses wrong Supabase method (CRITICAL)
**Problem:** `middleware.ts` calls `supabase.auth.admin.getUserById(token)` — this is an admin method that expects a user UUID, not a JWT token. Middleware will reject all authenticated requests.
**Fix:** Replace with `supabase.auth.getUser(token)` which validates JWT tokens for the anon client.

### 3. Missing npm dependencies (HIGH)
**Problem:** `lib/auth.ts` uses `jose` and `bcryptjs`, but both were removed from `package.json` in the latest commit.
**Fix:** Restore `jose`, `bcryptjs`, and `@types/bcryptjs` to dependencies/devDependencies.

### 4. Login/register don't return JWT token (HIGH)
**Problem:** Client-side code (`lib/db.ts`) expects `{ token }` in the login/register response and stores it in localStorage. The new Supabase-based routes return `session` instead, breaking client-side auth.
**Fix:** Generate a custom JWT in login/register routes using `generateToken()` from `lib/auth.ts`, and return `{ user, token }`.

### 5. Null crash on `skills.split()` (MEDIUM)
**Problem:** API routes call `user.sabiProfile.skills.split(',')` but `skills` can be `null`/`undefined` when a SabiProfile exists but skills are empty.
**Fix:** Use `(user.sabiProfile.skills || '').split(',')` in all affected routes: `auth/me`, `sabis`, `sabis/[id]`, `admin/users`.

### 6. Missing input validation on job creation (MEDIUM)
**Problem:** `app/api/jobs/route.ts` POST handler reads raw body fields without validation, allowing invalid data.
**Fix:** Import and use `CreateJobSchema` from `lib/validation.ts` to validate `sabiId`, `title`, `description`, `price`, `date`.

### 7. Missing input validation on job update (MEDIUM)
**Problem:** `app/api/jobs/[id]/route.ts` PATCH handler reads `status` from raw body without validation.
**Fix:** Import and use `UpdateJobSchema` from `lib/validation.ts`.

### 8. Missing input validation on review creation (MEDIUM)
**Problem:** `app/api/reviews/route.ts` reads `jobId`, `rating`, `comment` from raw body with only manual range checks.
**Fix:** Import and use `CreateReviewSchema` from `lib/validation.ts`.

### 9. Division by zero in review rating calculation (MEDIUM)
**Problem:** `app/api/reviews/route.ts` calculates `avgRating` by dividing by `allReviews.length` without checking for empty array. If a review is somehow created with no prior reviews, this crashes.
**Fix:** Guard with `allReviews.length > 0 ? ... : 0`.

### 10. auth/me route imports from wrong module (LOW)
**Problem:** `app/api/auth/me/route.ts` imports `getUserFromRequest` from `@/lib/auth` (old JWT module) instead of `@/lib/auth-helpers` (Supabase-compatible).
**Fix:** Change import to `@/lib/auth-helpers`.

### 11. Zod v4 API change (HIGH — type error)
**Problem:** `z.ZodError.errors` doesn't exist in Zod v4.3.6. The property is `issues`.
**Fix:** Replace `error.errors[0].message` with `error.issues[0].message` in all catch blocks.

### 12. Implicit `any` types in map callbacks (MEDIUM — type errors)
**Problem:** Several routes use implicit `any` in `.map()` callbacks: `admin/users` (`u`), `sabis` (`user`), `reviews` (`sum`, `r`).
**Fix:** Add explicit type annotations.

### 13. Supabase `.single()` returning `never` type (HIGH — type errors)
**Problem:** `supabase.from('...').select('*').single()` infers `never` for the result type in payment/webhook routes, causing cascade type errors on every property access.
**Fix:** Define explicit result interfaces and cast `.single()` results.

### 14. `supabaseServiceKey` possibly undefined (LOW — type error)
**Problem:** `getSupabaseAdmin()` passes `supabaseServiceKey` (type `string | undefined`) to `createClient` which expects `string`.
**Fix:** Cast with `as string` after the null check.

### 15. Public route `/api/sabis/[id]` blocked by middleware (MEDIUM)
**Problem:** `middleware.ts` only whitelists `/api/sabis` but not `/api/sabis/[id]`, so the Sabi detail page returns 401.
**Fix:** Add `/api/sabis/` prefix to public GET route prefixes.

### 16. `lib/payment.ts` has a nonsensical validation check (LOW)
**Problem:** `validatePaymentAmount()` checks `amount < config.appUrl` — comparing a Naira amount to a URL string.
**Fix:** Remove the bogus check; validate against `NEXT_PUBLIC_MIN_PAYMENT` directly.

### 17. `UpdateJobSchema` references `scheduledDate` but code uses `date` (MEDIUM)
**Problem:** Schema field name doesn't match the field name used in the PATCH handler.
**Fix:** Rename schema field from `scheduledDate` to `date`.

---

## Files Modified
- `middleware.ts` — fix auth method, add public route prefix
- `package.json` — restore missing deps
- `lib/auth.ts` — enforce JWT_SECRET required
- `lib/payment.ts` — fix validation logic
- `lib/validation.ts` — rename `scheduledDate` → `date`
- `app/api/auth/login/route.ts` — return JWT token, fix Zod API
- `app/api/auth/register/route.ts` — return JWT token, fix Zod API
- `app/api/jobs/route.ts` — add CreateJobSchema validation
- `app/api/jobs/[id]/route.ts` — add UpdateJobSchema validation, add auth to GET
- `app/api/reviews/route.ts` — add CreateReviewSchema, fix division by zero, fix Zod API
- `app/api/auth/me/route.ts` — fix import, guard skills.split
- `app/api/sabis/route.ts` — guard skills.split
- `app/api/sabis/[id]/route.ts` — guard skills.split
- `app/api/admin/users/route.ts` — guard skills.split, explicit type
- `app/api/payments/initialize/route.ts` — fix Zod API
- `app/api/payments/verify/route.ts` — fix Zod API
- `app/api/webhooks/paystack/route.ts` — fix crypto import
- `lib/supabase.ts` — cast service role key

## Files Created
- `services/paystack.ts` — Paystack service class
- `lib/payment.ts` — payment utility functions

---

## Remaining TypeScript Errors (after fixes above)
The Supabase generic `Database` type inference still produces `never` in some routes. The pragmatic fix is to define explicit result interfaces and cast query results. This is a known issue with Supabase JS v2 type inference when the generated `database.types.ts` doesn't perfectly match the runtime schema.

Specific remaining errors:
1. `app/api/payments/initialize/route.ts` — `job`, `existingPayment`, `payment` inferred as `never`
2. `app/api/payments/verify/route.ts` — `payment` inferred as `never`
3. `app/api/webhooks/paystack/route.ts` — `payment` inferred as `never`
4. `app/api/admin/users/route.ts` — implicit `any` on `u`
5. `app/api/sabis/route.ts` — implicit `any` on `user`
6. `app/api/reviews/route.ts` — implicit `any` on `sum`, `r`

## Validation Steps
1. Run `npm install` to install restored dependencies
2. Run `npx tsc --noEmit` to verify zero type errors
3. Run `npm run lint` to verify no lint errors
4. Test that `/api/sabis` and `/api/sabis/[id]` are publicly accessible
5. Test that `/api/auth/login` returns `{ user, token }`
6. Test that middleware validates JWT tokens correctly
