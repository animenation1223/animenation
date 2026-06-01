-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_until" TIMESTAMP(3),
    "maintenance_message" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
