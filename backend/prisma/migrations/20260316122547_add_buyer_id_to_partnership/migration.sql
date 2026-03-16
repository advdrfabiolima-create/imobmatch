-- AlterTable
ALTER TABLE "partnerships" ADD COLUMN     "buyerId" TEXT;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
