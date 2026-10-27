# PRODUCTION READINESS CHECKLIST

Legend: ✅ verified in repo · ⚠ partial · ❌ not met · ❓ cannot verify from repository

## Security
- ✅ Passwords hashed with bcrypt; constant-time login responses
- ✅ Server-side admin role checks on every admin API
- ✅ Ownership checks on answer / complete / results / pdf
- ✅ Webhook SHA-512 signature required
- ❌ Next.js patched (F-01)
- ❌ Reset/verify links not request-derived (F-02)
- ❌ Banned users cannot self-reactivate (F-03)
- ❌ Login/checkout/register rate limiting on shared store (F-04, F-09)
- ❌ Security headers / CSP (F-17)
- ⚠ Session revocation on password change (F-10)
- ❓ Cookie flags on deployed domain
- ❓ Secrets rotated; NEXTAUTH_SECRET random 32+ in Vercel
- ❓ Midtrans production keys separate from sandbox

## Database
- ✅ Prisma migrations present (3) and `migrate deploy` previously succeeded
- ✅ Key unique/FK constraints present
- ⚠ Missing indexes/constraints (F-26)
- ❌ Question versioning (F-13)
- ❓ Live schema equals migrations (not introspected)
- ❓ Backups / PITR enabled and restore tested
- ❓ Separate staging database

## Payments
- ✅ Server-side price; no client-side price override
- ✅ Frontend success cannot mark paid without Midtrans status
- ⚠ Idempotency (non-atomic) (F-06)
- ❌ Amount/state-machine validation, refunds (F-07)
- ❌ Pre-payment user creation removed (F-15)
- ⚠ Reconciliation cron (daily on Hobby, 24 h window) (F-23)
- ❓ Midtrans notification URL configured to production domain
- ❓ Sandbox end-to-end matrix executed

## Reliability / Ops
- ✅ 503 (not fake success) for assessment answer/complete/start
- ❌ Admin question routes still fake success (F-08)
- ❌ Automated tests and CI (F-16)
- ❌ Health endpoint (F-28)
- ⚠ Sentry configured (DSN presence unverified)
- ❓ Vercel plan limits (cron, function timeouts for PDF)
- ❓ Alerting for failed webhooks/emails

## Email
- ⚠ Resend → SMTP fallback implemented
- ❓ Custom domain with SPF/DKIM/DMARC (spam issue was observed in testing)
- ❌ Links independent of request headers (F-02)

## Compliance / business
- ❓ Privacy policy, Terms, Refund policy pages (required by Midtrans production)
- ❓ Data retention & deletion policy (delete endpoint exists; F-22)
- ❓ Scoring formula sign-off by product/psychometric owner (F-13)

**Overall: NOT READY for production with real payments** until at least the six "Immediate blockers" in REMEDIATION_PLAN.md are fixed and the sandbox payment matrix is executed.
