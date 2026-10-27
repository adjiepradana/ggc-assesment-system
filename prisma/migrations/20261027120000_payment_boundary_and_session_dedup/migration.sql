-- 1. Deduplicate any existing multiple IN_PROGRESS rows in assessment_sessions per user_id
-- Keep the single IN_PROGRESS session with the most answers (or latest started_at) and mark older duplicates as ABANDONED
WITH ranked_in_progress AS (
    SELECT
        s."id",
        ROW_NUMBER() OVER (
            PARTITION BY s."user_id"
            ORDER BY
                (SELECT COUNT(*) FROM "assessment_answers" a WHERE a."session_id" = s."id") DESC,
                s."started_at" DESC,
                s."id" DESC
        ) AS rn
    FROM "assessment_sessions" s
    WHERE s."status" = 'IN_PROGRESS'
)
UPDATE "assessment_sessions"
SET "status" = 'ABANDONED'::"SessionStatus"
WHERE "id" IN (
    SELECT "id" FROM ranked_in_progress WHERE rn > 1
);

-- 2. Create PostgreSQL partial unique index enforcing at most 1 IN_PROGRESS session per user
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_user_in_progress_session"
ON "assessment_sessions" ("user_id")
WHERE "status" = 'IN_PROGRESS';
