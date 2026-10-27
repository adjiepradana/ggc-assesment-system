# SECURITY AUDIT

Scope/limits: static review + dependency audit. No dynamic attack traffic was sent; no production or third-party system was touched. IDs refer to FINDINGS_REGISTER.md.

## 1. Authorization matrix (verified from handler code)

| Endpoint group | Anonymous | Student (own data) | Student (other user's data) | Admin |
|---|---|---|---|---|
| Pages `/student/*`, `/admin/*` | redirect (middleware; bypass risk F-01) | student ✔ / admin ✘ | n/a | admin ✔ |
| `/api/assessment/start,answer,complete` | 401 | ✔ (paid + verified for start) | 403 (ownership check) | admin passes paywall |
| `/api/assessment/results/*` (+pdf) | 401 | ✔ | 403 | ✔ any session |
| `/api/assessment/career-profile` | 401 | ✔ | **✔ (IDOR, F-05)** | ✔ |
| `/api/user/*` | 401 | ✔ own only (id from session) | n/a (no id param) | ✔ own |
| `/api/payment/checkout` | ✔ (guest flow) | ✔ | n/a | ✔ |
| `/api/payment/verify-status` | **✔ (F-19)** | ✔ | ✔ any order_id | ✔ |
| `/api/payment/notification` | signature required | – | – | – |
| `/api/order/track` | ✔ with email+order_id (5/min/IP, per instance) | ✔ | ✔ if email+order known | ✔ |
| `/api/admin/*` | 403 | 403 | 403 | ✔ (no granular permissions; single ADMIN role) |
| `/api/cron/*` | 401 w/o secret | 401 | 401 | 401 (secret only) |

Ownership checks that were verified present: `answer`, `complete`, `results`, `results/pdf`. Missing: `career-profile` (F-05), `verify-status` (F-19).

## 2. Authentication & session review

| Control | Result |
|---|---|
| Password hashing | bcryptjs cost 10 – acceptable; consider cost 12 / argon2 |
| Password policy | min 8 chars; no complexity/breach check |
| Login timing/enumeration | constant-time dummy hash ✔; generic error ✔; but `is_active=false` message only after valid password ✔ |
| Login rate limiting / lockout | **absent (F-04)** |
| Reset/verify tokens | 64-hex random ✔, expiry 1 h / 24 h ✔; reset token deleted on use ✔; verify GET non-consuming and plaintext storage (F-12) |
| Reset email link construction | **header-derived host (F-02)** |
| Session | NextAuth JWT, 30 days, 5-min DB revalidation of `is_active`/role ✔; not revoked on password change (F-10) |
| Cookie attributes | NextAuth defaults (HttpOnly, SameSite=Lax, Secure on https) – not overridden; **not verified at runtime** |
| Deactivation | enforced at login and revalidation ✔, but reversible by user (F-03) |
| CSRF | NextAuth CSRF for auth endpoints ✔; custom JSON APIs rely on SameSite=Lax cookies + JSON content type; no explicit Origin check (Low) |
| Open redirect | `callbackUrl` handled client-side with `router.push`; value not validated for same-origin (`includes("/auth/")` check only) – Low; `window` navigation to absolute URL possible via `router.push("https://…")` → treat as **Low, Unverified** |
| MFA / social login | not present |

## 3. Payment security

| Check | Result | Basis |
|---|---|---|
| Server-side price | ✔ constant 49000 server-side | checkout L12,176 |
| Frontend cannot override owner/price | ✔ | request body only supplies name/email/phone/password |
| Frontend redirect can't mark paid | ✔ (`verify-status` re-queries Midtrans with server key) | verify-status L44–91 |
| Webhook signature | ✔ SHA-512 (order_id+status_code+gross_amount+serverKey); skip if key placeholder (F-07) | notification L36–62, midtrans.ts L30–42 |
| Signature compare | non-constant-time string equality – Low | midtrans.ts L41 |
| Amount/currency cross-check | ✘ (F-07) | |
| Idempotency | partial (status guard) – not atomic (F-06) | |
| State machine | ✘ (F-07) | |
| Refund/chargeback | ✘ not handled | |
| Secrets server-side | ✔ server key only in server modules; client key public by design | |
| Sandbox vs production | env-driven `MIDTRANS_IS_PRODUCTION`; dev mock paths gated by `NODE_ENV!=="production"` ✔ | checkout L238, verify-status L94, simulate-success L15 |
| Sensitive data in DB | password hash in `orders` (F-14), raw gateway payloads stored | |
| Reconciliation | daily cron (Hobby), 15 min–24 h window (F-23) | |

Static confirmation only – **no sandbox payment test was executed** in this phase.

## 4. Data protection / configuration

* Secrets: `.env` is git-ignored; `git log --all -- .env` shows no history; no secrets found in tracked files (spot-checked `.env.example` placeholders). Client bundle only uses `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`/`SENTRY_DSN` (public by design).
* `lib/env.ts` validates five variables at import (but not `CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_*`).
* Logging: webhook logs order id/status/amount (no card data) ✔; several routes log `error.message` back to clients (F-27).
* Headers/CSP: none (F-17). CORS: default same-origin (no `Access-Control-Allow-*` configured) ✔.
* XSS: React escaping; `dangerouslySetInnerHTML` only for static JSON-LD (`layout.tsx`, `page.tsx`) ✔; email templates escape names in HTML (`sanitizedName`) but the plain-text/HTML bodies interpolate `studentName` in places – verify template uses `sanitizedName` consistently (Low, Unverified).
* Injection: all DB access via Prisma (no `$queryRaw`/`$executeRaw` found by grep) ✔.
* SSRF: outbound requests only to fixed Midtrans hosts with `encodeURIComponent(order_id)` ✔. File access: PDF route reads fixed `public/logo.png` ✔.
* Dependencies: see F-01 (next, nodemailer, postcss, xlsx).
* Expensive operations: PDF rendering and Midtrans status calls are unauthenticated-or-unthrottled (F-19, Low) .

## 5. Admin/RBAC review

* Every admin handler checks `session.user.role === "ADMIN"` server-side ✔. Single role, no granular permissions.
* Admin audit logging added for force-unlock, session reset, activate/deactivate, question update/deactivate; **question creation and export are not logged** (Low).
* Destructive admin action `RESET_SESSION` deletes all answers with no confirmation token and no soft-delete (Info).
* Admin question changes: see F-08, F-13.
* Admin UI guard is client-side + middleware (F-24).
