# FINDINGS REGISTER

Audit commit: `66fbe39` (branch `main`). Method: static code inspection + `tsc --noEmit` + `npm audit`. **No dynamic exploitation, sandbox payment, or E2E test was executed** (see TEST_RESULTS.md). "Confirmed" = demonstrated by reading the exact code path (and, for F-01, by tool output); it does **not** mean exploited.

Severity key: Critical · High · Medium · Low · Info. Status key: Confirmed · Likely · Unverified.

## Summary (sorted by severity)

| ID | Sev | Title | Area | Status |
|---|---|---|---|---|
| F-01 | **Critical** | Next.js 14.2.15 has known critical/high advisories (middleware auth bypass, image-optimizer RCE/DoS, SSRF, cache poisoning) | Dependencies | Confirmed (version) / Unverified (exploitability on Vercel) |
| F-02 | **High** | Email/Origin-header–derived links enable password-reset & verification **link poisoning** (introduced by `getRequestOrigin`) | Auth | Confirmed |
| F-03 | **High** | Admin account revocation (`is_active=false`) is silently undone by reset-password, verify, and re-purchase | Auth / RBAC | Confirmed |
| F-04 | **High** | No brute-force protection on login; weak/absent limits on checkout, register, verify-status, password change | Auth / Abuse | Confirmed |
| F-05 | Medium | `career-profile` GET/POST has no ownership check on `sessionId` (IDOR) and no paywall | Access control | Confirmed |
| F-06 | Medium | Order fulfillment is not an atomic claim → duplicate emails / invalidated tokens under concurrency | Payments | Confirmed (logic) / Unverified (race reproduced) |
| F-07 | Medium | Webhook lacks amount/state-machine validation; refunds/chargebacks ignored; late `pending` can reopen a FAILED order | Payments | Confirmed |
| F-08 | Medium | Admin question create/update/delete return fake success when DB fails | Integrity | Confirmed |
| F-09 | Medium | Rate-limit / cooldown state is per-instance memory (ineffective on serverless) | Abuse | Confirmed |
| F-10 | Medium | JWT sessions (30 d) are not invalidated on password change/reset | Auth | Confirmed |
| F-11 | Medium | Results/PDF APIs compute and persist scores for IN_PROGRESS sessions; `start` mutates on GET | Assessment | Confirmed |
| F-12 | Medium | Email verification mutates state on GET and tokens are reusable until expiry | Auth | Confirmed |
| F-13 | Medium | Scoring uses static question bank; admin edits/deactivation silently skew results (missing → 3.0) | Assessment | Confirmed |
| F-14 | Medium | Buyer password hash persisted in `orders.payment_details` after payment | Data | Confirmed |
| F-15 | Medium | Unauthenticated checkout creates/overwrites users pre-payment (account squatting) | Payments / Auth | Confirmed |
| F-16 | Medium | No automated tests, CI, or lint configuration | Quality | Confirmed |
| F-17 | Medium | No security headers / CSP configured | Config | Confirmed |
| F-18 | Low | `career-profile` injects synthetic answers (<20) and corrupts profile fields | Integrity | Confirmed |
| F-19 | Low | `verify-status` is unauthenticated and triggers outbound Midtrans calls + fulfillment | Payments | Confirmed |
| F-20 | Low | Predictable order IDs + order tracker discloses name/phone/snap token | Privacy | Confirmed |
| F-21 | Low | Excel export: formula injection; `xlsx@0.18.5` has unfixed advisories | Export | Likely |
| F-22 | Low | Account deletion lacks re-authentication; paid orders re-grant access by email | Account | Confirmed |
| F-23 | Low | Cron reconciliation limited to 15 min–24 h window and daily on Hobby; non-constant-time secret compare | Reliability | Confirmed |
| F-24 | Low | Admin UI shell has no server-side guard (middleware only); static "PostgreSQL Connected" badge | RBAC / UI | Confirmed |
| F-25 | Low | User enumeration via 409 on register/checkout | Privacy | Confirmed |
| F-26 | Low | Missing DB constraints / indexes (single IN_PROGRESS session, `orders.user_id`, etc.) | Database | Confirmed |
| F-27 | Info | Unbounded profile/career string inputs; error `message` leaked in some 500s | Hardening | Confirmed |
| F-28 | Info | No health endpoint, backup/restore evidence, or staging separation visible | Ops | Unverified |

---

## Detailed findings

### F-01 — Vulnerable Next.js version (Critical)
* **Evidence:** `package.json` pins `next` `14.2.15`; `npm audit --omit=dev` reports `next` as **critical** (ranges include `<14.2.25` *Authorization Bypass in Next.js Middleware*, image-optimizer RCE advisories for AVIF/SVG, SSRF in rewrites/middleware redirects, multiple DoS and cache-poisoning advisories), plus `nodemailer` (<10.1.4, via next-auth peer), `postcss` (bundled in next) and `xlsx` (no fix).
* **Impact:** Middleware (`src/middleware.ts`) is the only guard for `/admin/*` and `/student/*` *pages*; a middleware bypass exposes the admin UI shell (API handlers still check roles). Other advisories add DoS/SSRF/RCE risk depending on features used.
* **Preconditions:** Depends on the specific advisory; Vercel's platform may mitigate some.
* **Safe repro:** `npm audit --omit=dev` (read-only).
* **Remediation:** Upgrade Next.js to the latest 14.2.x patch (≥14.2.35) or a supported major; re-run build/E2E; add server-side guards in admin layout (F-24).
* **Regression tests:** CI step `npm audit --omit=dev --audit-level=high`; E2E that unauthenticated request with `x-middleware-subrequest` header is still redirected.
* **Status:** Confirmed (installed version in vulnerable range); exploitability on production **Unverified**. **Confidence:** High for version, Low for exploit.

### F-02 — Link poisoning via request-controlled base URL (High)
* **Evidence:** `src/lib/request-origin.ts` returns `Origin` → `Referer` → `X-Forwarded-Host`/`Host`; `src/lib/mail.ts` `resolveBaseUrl(customBaseUrl)` uses it **before** `NEXTAUTH_URL`; called from `forgot-password`, `register`, `resend-verification` routes. (Introduced in commit `14d0b4f`.)
* **Impact:** An attacker can POST `/api/auth/forgot-password` for a victim email with `Origin: https://attacker.example`. The victim receives a legitimate GGC email whose reset link points to the attacker's host and carries the valid token → account takeover on click.
* **Preconditions:** Victim clicks the link; attacker can set headers (curl, not browser).
* **Safe repro:** Local/staging only, against a test account with the mail transport mocked; inspect generated URL.
* **Remediation:** Build links only from a server-side allow-listed `NEXTAUTH_URL`/`APP_URL`; drop request-header derivation.
* **Tests:** Unit test that a forged `Origin` never alters the link host; snapshot of email URLs.
* **Status:** Confirmed by code. **Confidence:** High; not exploited.

### F-03 — Deactivated users can self-reactivate (High)
* **Evidence:** Admin revoke sets `is_active=false` (`admin/students/route.ts` TOGGLE/REVOKE). But `auth/reset-password/route.ts` L77–80 sets `is_active: true`; `auth/verify` GET L46–52 and POST L113–119 set `is_active: true`; `fulfillment.ts` L105–109 sets `is_active: true` on any paid order.
* **Impact:** A banned student can use "forgot password" (or old verification link, or a new purchase) to regain access, defeating RBAC controls and abuse bans.
* **Remediation:** Never mutate `is_active` outside admin actions; reject reset/verify/fulfillment effects (or only fulfill order, not activate) for deactivated users.
* **Tests:** Deactivate user → reset password → login must still fail.
* **Status:** Confirmed. **Confidence:** High.

### F-04 — Missing brute-force / abuse controls (High)
* **Evidence:** `lib/auth.ts` `authorize` has no attempt counter, IP/email throttling or lockout; bcrypt cost 10 per attempt. No limiter in `checkout`, `register`, `verify-status`, `user/password`. Only `resend-verification`, `forgot-password` (60 s cooldown) and `order/track` (5/min/IP) have in-memory limits.
* **Impact:** Credential stuffing/brute force; CPU exhaustion; order/user spam via checkout (creates users + orders + Midtrans calls).
* **Remediation:** Shared store limiter (Upstash/Redis or Postgres table), per-IP **and** per-email on login; CAPTCHA/Turnstile on register/checkout; lockout/backoff.
* **Tests:** Integration test of 429 after N failed logins; load test limited to staging.
* **Status:** Confirmed absent. **Confidence:** High.

### F-05 — IDOR on career-profile (Medium)
* **Evidence:** `career-profile/route.ts` GET L35–49 and POST L160–173 fetch `assessmentSession.findUnique({id: sessionId})` with **no `user_id` check**; any authenticated user (no paid/verified gate) receives orientation derived from that session's answers.
* **Impact:** Disclosure of another user's derived results if a session UUID leaks (UUIDs unguessable; leak via logs/support/URLs).
* **Remediation:** Require `session.user_id === currentUser` (or ADMIN); apply paywall gate.
* **Tests:** User A requests user B's `sessionId` → 403.
* **Status:** Confirmed. **Confidence:** High.

### F-06 — Non-atomic fulfillment (Medium)
* **Evidence:** `fulfillment.ts` L48–63 read-then-write; three callers (webhook, `verify-status`, cron). `updateMany WHERE status<>SUCCESS` claim absent; no `$transaction`.
* **Impact:** Concurrent webhook + client verify (both occur on every successful Snap payment) can both pass the guard → two emails; second `deleteMany`+`create` invalidates the first email's token.
* **Remediation:** `prisma.order.updateMany({where:{id, status:{not:'SUCCESS'}}, data:{status:'SUCCESS'}})`; proceed only if `count===1`; wrap provisioning in an interactive transaction (previously blocked by a TS error—needs Prisma typing fix) or compensating logic; send email after commit.
* **Tests:** Parallel `Promise.all` of 5 fulfillment calls → exactly one email/token.
* **Status:** Confirmed (logic); race itself **not reproduced**. **Confidence:** Medium-High.

### F-07 — Webhook validation & state machine gaps (Medium)
* **Evidence:** `notification/route.ts`: no comparison of `gross_amount` to `order.amount`; non-success branch (L97–116) maps anything not failed to `PENDING`, so a delayed `pending` after `expire` re-opens a FAILED order; `refund`/`chargeback`/`partial_refund` on a SUCCESS order are swallowed by the idempotency early-return (L88–94) → access retained; signature check skipped when key contains placeholder text (L46,60); 500 returns `error.message`.
* **Impact:** Inconsistent order states; no refund entitlement revocation; minor info leak.
* **Remediation:** Explicit transition table (PENDING→SUCCESS/FAILED/EXPIRED; terminal states immutable except SUCCESS→REFUNDED); verify `gross_amount` and `order_id` prefix; fail closed when server key missing; add `REFUNDED` status and revoke policy.
* **Tests:** Replay matrix (see TEST_RESULTS payment matrix).
* **Status:** Confirmed. **Confidence:** High.

### F-08 — Fake-success fallbacks in admin question routes (Medium)
* **Evidence:** `admin/questions/route.ts` POST L150–168; `admin/questions/[id]/route.ts` PATCH (catch returns `success:true … (Dev Mode)`) and DELETE (same). GET falls back to static list.
* **Impact:** Admin believes a question was created/edited/deactivated when the DB write failed (the exact class fixed in Phase 1.1 for answers).
* **Remediation:** Return 503 on DB failure; remove dev fallbacks in production builds.
* **Tests:** Mock Prisma failure → expect 503.
* **Status:** Confirmed. **Confidence:** High.

### F-09 — Per-instance in-memory limits (Medium)
* **Evidence:** `Map`-based limiters in `order/track`, `forgot-password`, `resend-verification`; Vercel serverless instances don't share memory; IP read from client-supplied `x-forwarded-for` first element.
* **Remediation:** Central store (see F-04); use platform-provided IP.
* **Status:** Confirmed. **Confidence:** High.

### F-10 — Sessions survive password change (Medium)
* **Evidence:** `user/password` and `reset-password` update only `password_hash`; JWT has no `tokenVersion`/`passwordChangedAt` check (`lib/auth.ts` jwt callback).
* **Impact:** Stolen session remains valid up to 30 days after the victim resets password.
* **Remediation:** Add `token_version` column; embed in JWT; compare in 5-min revalidation; shorten `maxAge`.
* **Status:** Confirmed. **Confidence:** High.

### F-11 — Partial results & GET with side effects (Medium)
* **Evidence:** `results/[sessionId]/route.ts` L128–175 returns/backfills `result_data` whenever any answers exist, regardless of `status`; PDF route same; `assessment/start` GET creates `AssessmentSession`.
* **Impact:** Students can preview scores mid-test and edit answers until completion (integrity of "official" result); duplicate sessions under concurrency (see F-26); prefetching crawlers/links can create rows.
* **Remediation:** Return 409 unless `status==='COMPLETED'`; move session creation to POST; never backfill for in-progress.
* **Status:** Confirmed. **Confidence:** High.

### F-12 — Verification via GET, reusable token (Medium)
* **Evidence:** `auth/verify` GET marks `email_verified=true` and does not delete the token; email scanners/prefetchers that follow links verify accounts; token plaintext in DB.
* **Remediation:** Make GET read-only (validation only), consume token in POST; store hashed tokens.
* **Status:** Confirmed. **Confidence:** High.

### F-13 — Scoring vs. DB question bank mismatch (Medium)
* **Evidence:** `lib/scoring.ts` L243–259 maps only the static 84 codes; missing codes default to 3.0 (L290, L316); `complete` compares answer count with `question.count({is_active:true})` and skips the check when count is 0.
* **Impact:** Deactivating a question lowers the required count but scoring still expects its code → neutral 3.0 injected; new admin questions never scored; historical question text editable.
* **Remediation:** Single source of truth + versioned question sets; require all scoring codes answered; snapshot question set per session.
* **Status:** Confirmed. **Confidence:** High. Intended formula ambiguity: `fitScore = ((composite-1)/4)*68+30` (range 30–98) and `percentage` floor of 10 are undocumented calibrations — **needs product-owner confirmation**.

### F-14 — Password hash stored in orders (Medium)
* **Evidence:** `checkout/route.ts` L188–192; `fulfillment.ts` L117–127 preserves `existingDetails`.
* **Remediation:** Use a short-lived `PendingRegistration` table; delete after fulfillment; strip secrets before storing payloads.
* **Status:** Confirmed. **Confidence:** High.

### F-15 — Pre-payment user creation / overwrite (Medium)
* **Evidence:** `checkout/route.ts` L118–169 creates the user (or overwrites password of an "abandoned" unverified account with no orders/sessions) **before** payment.
* **Impact:** Anyone can squat emails or hijack a not-yet-verified registration's password; victims then see "email already registered".
* **Remediation:** Create user only in fulfillment (after verified payment); never mutate existing users from anonymous requests.
* **Status:** Confirmed. **Confidence:** High.

### F-16 — No tests / CI / lint config (Medium)
* **Evidence:** `git ls-files` shows no test files, no `.github/`, no ESLint config; `npm run lint` not configured.
* **Remediation:** Add Vitest/Jest for scoring + fulfillment + auth; Playwright E2E against Midtrans sandbox; GitHub Actions (typecheck, lint, test, audit).
* **Status:** Confirmed. **Confidence:** High.

### F-17 — No security headers (Medium)
* **Evidence:** `next.config.mjs` defines only Sentry wrapper; `vercel.json` has only crons.
* **Remediation:** Add CSP (nonce-based, allow Midtrans/Sentry), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`.
* **Status:** Confirmed. **Confidence:** High.

### F-18 … F-28 (Low / Info)
| ID | Evidence | Remediation |
|---|---|---|
| F-18 | `career-profile` POST/GET L54–60 / L179–185 substitute deterministic fake answers when <20; POST create path stores `school_name=educationLevel`, `grade=currentMajor` | Remove synthetic fallback (return 400); validate payload with Zod |
| F-19 | `payment/verify-status` has no auth/rate limit; each call → outbound `fetch` | Require session owner or signed token; limit calls |
| F-20 | `checkout` L177 `GGC-${Date.now()}-${randomInt(1000,10000)}`; `order/track` returns phone, snap token | Use `crypto.randomUUID()`; mask phone; omit snap token for non-pending |
| F-21 | `admin/export` writes user strings to XLSX unsanitised; `xlsx` advisories (no fix) | Prefix `'` for cells starting `= + - @`; consider `exceljs` |
| F-22 | `user/delete` requires only typing "HAPUS"; orders detach but keep `customer_email` access | Require password; mark order consumed or link by user |
| F-23 | `cron/sync-midtrans` window 24 h; `authHeader === cronSecret` | Widen window, timing-safe compare; alert on stuck PENDING |
| F-24 | `admin/layout.tsx` is `"use client"` with no server check; static DB badge | Server-side `getServerSession` + role redirect |
| F-25 | `register` / `checkout` 409 messages | Generic response + email notice |
| F-26 | No partial unique index for IN_PROGRESS; no `orders(user_id)` index | Add migrations (see ERD doc) |
| F-27 | `profile` PUT / career JSON unbounded; some 500s return `error.message` (`user/password`, `user/delete`, `user/profile`, webhook) | Length caps, generic errors |
| F-28 | No `/api/health`; no backup/restore evidence; single env set visible | Add health check, Supabase PITR + restore drill, staging project |
