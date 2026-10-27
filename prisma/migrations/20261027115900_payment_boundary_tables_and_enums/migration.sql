-- 1. Add new enum values (must be committed in their own transaction before use in UPDATE statements)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CHARGEBACK';
ALTER TYPE "SessionStatus" ADD VALUE IF NOT EXISTS 'ABANDONED';

-- 2. Create pending_registrations table
CREATE TABLE IF NOT EXISTS "pending_registrations" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pending_registrations_order_id_key" ON "pending_registrations"("order_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pending_registrations_order_id_fkey'
  ) THEN
    ALTER TABLE "pending_registrations"
      ADD CONSTRAINT "pending_registrations_order_id_fkey"
      FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Create email_outbox table
CREATE TABLE IF NOT EXISTS "email_outbox" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "locked_until" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_outbox_idempotency_key_key" ON "email_outbox"("idempotency_key");
CREATE INDEX IF NOT EXISTS "email_outbox_status_locked_until_idx" ON "email_outbox"("status", "locked_until");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_outbox_order_id_fkey'
  ) THEN
    ALTER TABLE "email_outbox"
      ADD CONSTRAINT "email_outbox_order_id_fkey"
      FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Add missing indexes on orders (F-26)
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx" ON "orders"("status", "created_at");
