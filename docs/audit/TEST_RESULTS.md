# TEST RESULTS

**Honest scope statement:** The repository contains **no automated test suite, no CI, and no ESLint config**. This audit executed only the checks below. Everything else is marked *Not executed*. No payments, emails, DB writes, or attack traffic were generated in this phase.

## 1. Commands actually executed

| # | Command | Environment | Effect | Result |
|---|---|---|---|---|
| 1 | `npx tsc --noEmit` (run after the last code commit `66fbe39`, at 2026-10-25 20:31) | local Windows, sandbox | read-only | **Pass – 0 errors** |
| 2 | `npm run build` (run at 2026-10-25 18:41, before commits `14d0b4f`/`66fbe39`) | local, network allowed (Google Fonts) | writes `.next/` only | **Pass** – 20 static pages, all API routes compiled. *Not re-run at HEAD.* |
| 3 | `npm audit --omit=dev --json` (2026-10-26) | local, network | read-only | **Fail** – 5 vulnerable packages (1 critical: `next`; 4 high: `nodemailer`, `postcss`, `xlsx`, `next` chain) |
| 4 | `git ls-files`, `git log --all -- .env`, `git grep` (patterns: `dangerouslySetInnerHTML`, `callbackUrl`, `queryRaw`, `executeRaw`, `eval(`, `getServerSession`) | local | read-only | `.env` never committed; no raw SQL; auth call present in every API handler |

## 2. Checks not executed (and why)

| Check | Status | Reason |
|---|---|---|
| Lint (`next lint`) | Not executed | No ESLint config; command would prompt to create one (modifies repo) |
| Unit / integration / API tests | Not executed | None exist |
| Browser E2E | Not executed | None exist; no authorized test accounts/sandbox credentials supplied |
| Midtrans sandbox payment tests | Not executed | Requires sandbox keys and a public webhook URL; out of audit-only scope |
| Live DB schema introspection | Not executed | No read-only DB credentials approved |
| Runtime cookie/header inspection of deployed site | Not executed | Deployed environment not authorized for testing |
| Load / concurrency tests | Not executed | Risk of DoS; no staging environment |

## 3. Scenario matrix (A–N) — expected vs. actual

"Actual (static)" means derived from code reading, **not** a test run.

| ID | Scenario | Expected | Actual (static) | Verified by test? |
|---|---|---|---|---|
| A | Register & login | account created unverified; login works | matches; login allowed pre-verification | No |
| B | Failed login / logout / expiry | generic error; throttling | generic error ✔; **no throttling** (F-04); JWT 30 d | No |
| C | Purchase via sandbox | order → Snap → paid | code path consistent | No |
| D | Pending → success | status updated, user provisioned | webhook + verify-status + cron all route to `fulfillPaidOrder` | No |
| E | Payment fails/expires | order FAILED/EXPIRED, no access | webhook sets FAILED (EXPIRED only via cron); access remains locked ✔ | No |
| F | Duplicate/invalid webhook | idempotent / rejected | invalid signature → 403 ✔; duplicate → early return ✔ (race F-06) | No |
| G | Paid order unlocks assessment | `start` allows | `checkUserPaidAccess` ✔ + email verified required | No |
| H | Complete & persist result | atomic, computed once | `updateMany` atomic ✔ | No |
| I | History & results | scoped to user | ✔ for results/pdf; career-profile unscoped (F-05) | No |
| J | User A vs User B records | 403 | ✔ answer/complete/results/pdf; ✘ career-profile | No |
| K | Student → admin | denied | page redirect (middleware) + API 403 ✔ | No |
| L | Admin updates assessment | persists or errors | fake success on DB failure (F-08) | No |
| M | Validation / refresh / double submit | consistent | answer upsert idempotent ✔; frontend AbortController + localStorage queue present (not exercised) | No |
| N | DB / external failure | 5xx, no data loss | start/answer/complete → 503 ✔; admin questions → fake success ✘ | No |

## 4. Payment test matrix (to execute in Midtrans sandbox — currently unexecuted)

| Case | Input | Expected | Static prediction |
|---|---|---|---|
| Valid payment | settlement, valid sig | SUCCESS, 1 email | ✔ |
| Declined | deny | FAILED, locked | ✔ |
| Pending | pending | stays PENDING | ✔ |
| Duplicate notification ×2 sequential | settlement ×2 | one fulfillment | ✔ |
| Duplicate **concurrent** | settlement ×2 parallel | one fulfillment | ✘ possible double (F-06) |
| Invalid signature | tampered | 403 | ✔ |
| Missing `signature_key` | none | 401 | ✔ |
| Amount mismatch | gross_amount ≠ order.amount (valid sig for new amount impossible without key) | reject | ✘ not checked (F-07) |
| Expired | expire | FAILED/EXPIRED | FAILED via webhook, EXPIRED via cron (D-7) |
| Late pending after expire | pending | stay FAILED | ✘ becomes PENDING (F-07) |
| Refund after success | refund | revoke/mark | ✘ ignored |
| Retry/webhook missed | none | cron reconciles | ✔ within 24 h window, daily run |

## 5. Suggested regression suite (to be built)

1. Vitest: `calculateAssessmentScores` golden-vector tests; boundary (all 1s, all 5s, missing codes).
2. Vitest + mocked Prisma: `fulfillPaidOrder` concurrency and idempotency; webhook transition table.
3. Integration (Postgres test DB): ownership checks for `answer/complete/results/career-profile`.
4. Playwright E2E on staging with Midtrans sandbox: journeys A–N.
5. CI: `tsc`, `next lint`, tests, `npm audit --audit-level=high`.
