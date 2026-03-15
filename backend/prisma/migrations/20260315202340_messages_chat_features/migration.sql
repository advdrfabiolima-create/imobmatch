-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "replyToId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastSeen" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
