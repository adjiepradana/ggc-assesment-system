# ERD AND DATA INTEGRITY

Basis: **repository-based** (`prisma/schema.prisma`, `prisma/migrations/*`). The live Supabase schema was not introspected during this audit; `prisma migrate deploy` reported all 3 migrations applied in an earlier session, so the schema is believed (not verified in this phase) to match.

## 1. Verified ERD (from `schema.prisma`)

```mermaid
erDiagram
    User ||--o| StudentProfile : "has (user_id UNIQUE, CASCADE)"
    User ||--o{ AssessmentSession : "takes (CASCADE)"
    User ||--o{ VerificationToken : "has (CASCADE)"
    User ||--o{ Order : "places (user_id NULLABLE, SET NULL)"
    User ||--o{ AccessCode : "used_by (NULLABLE, SET NULL) LEGACY"
    AssessmentSession ||--o{ AssessmentAnswer : "contains (CASCADE)"
    Question ||--o{ AssessmentAnswer : "answered in (RESTRICT)"

    User {
      uuid id PK
      string email UK
      string password_hash
      enum role "STUDENT|ADMIN"
      bool is_active
      bool email_verified
    }
    StudentProfile {
      uuid id PK
      uuid user_id UK_FK
      string full_name
      json career_preferences
    }
    Question {
      uuid id PK
      string code UK
      enum dimension_category
      string subdimensi
      bool is_active
    }
    AssessmentSession {
      uuid id PK
      uuid user_id FK
      enum status "IN_PROGRESS|COMPLETED"
      json result_data
      json career_profile
    }
    AssessmentAnswer {
      uuid id PK
      uuid session_id FK
      uuid question_id FK
      int selected_value
    }
    Order {
      cuid id PK
      string order_id UK
      string user_id FK_NULL
      string customer_email
      int amount
      enum status "PENDING|SUCCESS|FAILED|EXPIRED"
      json payment_details
    }
    VerificationToken {
      cuid id PK
      string token UK
      uuid user_id FK
      datetime expires_at
    }
    PasswordResetToken {
      cuid id PK
      string email "no FK"
      string token UK
      datetime expires_at
    }
    AccessCode {
      cuid id PK
      string code UK
      enum status
    }
    AdminAuditLog {
      cuid id PK
      string admin_id "no FK"
      string action
      string target_id "no FK"
      json details
    }
```

## 2. Table responsibilities

| Table | Responsibility |
|---|---|
| `users` | Identity, role, activation flag, email-verified flag, bcrypt hash |
| `student_profiles` | Name, phone, school, grade, `career_preferences` JSON |
| `questions` | Editable question bank (code, dimension, text, options, active flag) |
| `assessment_sessions` | One attempt; status; pre-computed `result_data` JSON |
| `assessment_answers` | Likert 1–5 answers, unique per (session, question) |
| `orders` | Midtrans orders; amount (IDR int); status; raw gateway payloads and (for guest checkout) the buyer's password hash in `payment_details` |
| `verification_tokens` / `password_reset_tokens` | Single-purpose tokens (plaintext, unique) |
| `access_codes` | Legacy Lynk.id codes – model still present, code removed |
| `admin_audit_logs` | Admin action trail |

## 3. Relationship inventory

| From → To | Cardinality | FK | On delete |
|---|---|---|---|
| StudentProfile → User | 1:1 | `user_id` UNIQUE | CASCADE |
| AssessmentSession → User | N:1 | `user_id` | CASCADE |
| AssessmentAnswer → AssessmentSession | N:1 | `session_id` | CASCADE |
| AssessmentAnswer → Question | N:1 | `question_id` | RESTRICT |
| Order → User | N:1 (optional) | `user_id` | SET NULL |
| VerificationToken → User | N:1 | `user_id` | CASCADE |
| AccessCode → User | N:1 (optional) | `used_by` | SET NULL |
| PasswordResetToken → User | **logical only** via `email` | none | – |
| AdminAuditLog → User | **logical only** via `admin_id`/`target_id` | none | – |

## 4. Integrity issues

| ID | Issue | Evidence | Severity |
|---|---|---|---|
| D-1 | **No DB guard against multiple `IN_PROGRESS` sessions per user.** `start` does find-then-create (GET) → concurrent calls create duplicates. Needs partial unique index `(user_id) WHERE status='IN_PROGRESS'`. | `assessment/start/route.ts` L69–101; schema has only `@@index([user_id])` | Medium |
| D-2 | **`orders.payment_details` stores the buyer's bcrypt hash** (`hashedPassword`) and keeps it after SUCCESS. A credential hash lives in a JSON blob that is also fed raw gateway payloads. | `checkout/route.ts` L188–192; `fulfillment.ts` L117–127 spreads `existingDetails` | Medium |
| D-3 | **Order amount/currency not tied to a catalog**; price is a code constant (49000). No `currency` column, no product/entitlement table: entitlement is *derived* (`SUCCESS` order by `user_id` **or** `customer_email`). | `schema.prisma` Order; `access-check.ts` L26–34 | Low–Medium |
| D-4 | `Order.user_id` is set `NULL` on user deletion but the order still grants access to any later account with the same `customer_email`. | `user/delete/route.ts` L73–76; `access-check.ts` | Low |
| D-5 | `PasswordResetToken` and `AdminAuditLog` have no FK; orphan rows possible, tokens not cleaned up on user delete. | schema | Low |
| D-6 | No check constraints: `selected_value` 1–5 (enforced only in API), `amount > 0`. | schema | Low |
| D-7 | `OrderStatus.EXPIRED` vs `FAILED` set inconsistently (webhook maps `expire`→FAILED; cron maps `expire`→EXPIRED). | `notification/route.ts` L70–74, L98; `cron/sync-midtrans` L158 | Low |
| D-8 | Question versioning absent: editing `question_text`/deactivating a question mutates history; `result_data` snapshot protects totals but not the text shown to the user later. | `admin/questions/[id]/route.ts` | Medium (design) |
| D-9 | Legacy `AccessCode` model/enum retained. | schema L23–26, L174–187 | Info |
| D-10 | Token columns stored in plaintext; `@@index([token])` duplicates the `@unique` index. | schema | Info |

## 5. Indexes / performance

* Present and appropriate: `users.email` unique, `orders.order_id` unique, `orders(status)`, `orders(customer_email)`, `assessment_sessions(user_id)`, `(status)`, answers `(session_id)` and unique `(session_id, question_id)`.
* Missing / suggested: `orders(user_id)` (used by `access-check` and `user` includes), `orders(created_at)` (admin list sort, cron range scan), composite `orders(status, created_at)` for the cron query.
* Redundant: `@@index([order_id])`, `@@index([code])`, `@@index([token])` duplicate unique indexes.
* Query patterns: admin students/export load *all* students in one query (pagination absent; now without answers – improvement). `results` & `pdf` routes still load all answers + questions even when `result_data` exists (unnecessary reads). `verify-status` is unauthenticated and issues an outbound Midtrans request per call.

## 6. Schema ↔ migration ↔ application discrepancies

* Migration set: `20261025180000_init_baseline_ggc_v1`, `…181000_add_session_result_data`, `…183500_add_admin_audit_log`. Baseline created from a `db push` history – rollback scripts do not exist (Prisma doesn't generate them).
* Application writes `result_data` only at completion; results route backfills it for **in-progress** sessions too (F-11).
* `StudentProfile.school_name`/`grade` are overloaded by `career-profile` POST (`school_name = educationLevel`, `grade = currentMajor`) when it creates a profile (data-quality bug, F-13).
* `Question` table is not the scoring source of truth (static `questions-data.ts` is) (F-14).
