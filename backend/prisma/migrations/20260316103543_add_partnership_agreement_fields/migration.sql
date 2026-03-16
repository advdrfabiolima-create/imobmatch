-- AlterTable
ALTER TABLE "partnerships" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "agreementHash" TEXT,
ADD COLUMN     "receiverIp" TEXT,
ADD COLUMN     "requesterIp" TEXT;
