-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "listingType" TEXT NOT NULL DEFAULT 'SALE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cpfCnpj" TEXT,
ADD COLUMN     "personType" TEXT NOT NULL DEFAULT 'PF';
