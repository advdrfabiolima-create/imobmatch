-- Add status, photoUrl, propertyId to opportunities

ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "propertyId" UUID;

-- Add FK constraint only if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'opportunities_propertyId_fkey'
  ) THEN
    ALTER TABLE "opportunities"
      ADD CONSTRAINT "opportunities_propertyId_fkey"
      FOREIGN KEY ("propertyId") REFERENCES "properties"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
