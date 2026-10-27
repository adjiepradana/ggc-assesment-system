# REMEDIATION PLAN

Nothing below has been implemented. Awaiting explicit approval. Effort is given only as relative size (S ≤ ½ day, M ≈ 1–2 days, L ≈ 3+ days) because no timing evidence exists.

## Immediate blockers (before any real-money go-live)

| Order | Finding | Fix | Size | Depends on |
|---|---|---|---|---|
| 1 | F-02 | Remove header-derived base URL; use allow-listed `NEXTAUTH_URL` for all email links; unit test with forged `Origin` | S | – |
| 2 | F-01 | Upgrade Next.js to latest 14.2.x patch (or supported major), bump `nodemailer`/`next-auth` as advised, re-run build + smoke tests | M | tests (#11) ideally first |
| 3 | F-03 | Stop writing `is_active=true` in reset/verify/fulfillment; admin-only toggling | S | – |
| 4 | F-04 / F-09 | Central rate limiter (Upstash Redis or Postgres table) on login, register, checkout, verify-status, password endpoints; Turnstile on register/checkout | M | infra choice |
| 5 | F-06 / F-07 | Atomic order claim (`updateMany … status<>SUCCESS`), transition table, amount/order checks, fail-closed on missing key, add `REFUNDED` policy | M | – |
| 6 | F-15 / F-14 | Create users only after verified payment; `PendingRegistration` table; delete hash after fulfillment | M | #5 |

## High-priority (first release cycle)

| Finding | Fix | Size |
|---|---|---|
| F-05 | Ownership + paywall check in `career-profile`; remove synthetic answers (F-18) | S |
| F-10 | `token_version` in JWT; bump on password change/reset | S–M |
| F-11 / F-12 | Results only for COMPLETED; `start` creation via POST; verification GET read-only + hashed tokens | M |
| F-13 | Single question source of truth + versioned question sets; require all scoring codes | L |
| F-08 | 503 instead of fake success in admin question routes | S |
| F-16 | Tests + CI (see TEST_RESULTS §5) | L |
| F-17 | Security headers + CSP | S–M |
| F-24 | Server-side admin guard in layout | S |

## Subsequent improvements

F-19 (auth/limit `verify-status`), F-20 (UUID order IDs, mask tracker output), F-21 (export hardening / replace `xlsx`), F-22 (re-auth on delete), F-23 (cron window/alerts, timing-safe compare), F-25 (generic enumeration responses), F-26 (migrations: partial unique index on `(user_id) WHERE status='IN_PROGRESS'`, `orders(user_id)`, `orders(status, created_at)`), F-27 (input caps, generic errors), F-28 (health check, PITR backups + restore drill, staging project).

## Implementation order & dependencies

1. Tests scaffold (#11) → protects all following changes.
2. F-02, F-03 (isolated, low risk).
3. F-01 upgrade (run tests + sandbox payment smoke).
4. Payment hardening (F-06, F-07, F-14, F-15) as one change set with a Prisma migration; validate with the payment matrix in Midtrans sandbox.
5. Rate limiting infra (F-04/F-09).
6. Assessment integrity (F-05, F-11, F-13, F-18) + migration for question versioning.
7. Auth sessions (F-10, F-12).
8. Config/ops (F-17, F-24, F-26, F-28).

## Regression strategy

* Each fix lands with a failing-first test (see per-finding "Tests" in FINDINGS_REGISTER).
* Payment changes require the full sandbox matrix pass (staging).
* Migrations: apply to a staging Supabase branch first; back up before `prisma migrate deploy`.
* Add CI gate: typecheck, lint, tests, `npm audit --audit-level=high`.
