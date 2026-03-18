-- CreateEnum
CREATE TYPE "EarlyAccessStatus" AS ENUM ('WAITING', 'INVITED', 'REGISTERED');

-- AlterTable
ALTER TABLE "early_access_leads" ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "status" "EarlyAccessStatus" NOT NULL DEFAULT 'WAITING';
