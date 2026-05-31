DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'created', 'authorized', 'captured', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "payment_gateway" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_order_id" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_id" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_captured_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders"("payment_status");
CREATE INDEX IF NOT EXISTS "orders_payment_order_id_idx" ON "orders"("payment_order_id");

CREATE TABLE IF NOT EXISTS "payment_transactions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "order_id" TEXT,
  "payment_method" "PaymentMethod" NOT NULL,
  "gateway" TEXT NOT NULL,
  "gateway_order_id" TEXT NOT NULL,
  "gateway_payment_id" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "PaymentStatus" NOT NULL DEFAULT 'created',
  "signature_verified" BOOLEAN NOT NULL DEFAULT false,
  "failure_reason" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "payment_transactions_user_id_created_at_idx"
  ON "payment_transactions"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "payment_transactions_gateway_order_id_idx"
  ON "payment_transactions"("gateway_order_id");
CREATE INDEX IF NOT EXISTS "payment_transactions_gateway_payment_id_idx"
  ON "payment_transactions"("gateway_payment_id");
CREATE INDEX IF NOT EXISTS "payment_transactions_status_idx"
  ON "payment_transactions"("status");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_transactions_user_id_fkey'
  ) THEN
    ALTER TABLE "payment_transactions"
      ADD CONSTRAINT "payment_transactions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_transactions_order_id_fkey'
  ) THEN
    ALTER TABLE "payment_transactions"
      ADD CONSTRAINT "payment_transactions_order_id_fkey"
      FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

