-- Add status, photoUrl, propertyId to opportunities (idempotent)

ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "propertyId" TEXT;
