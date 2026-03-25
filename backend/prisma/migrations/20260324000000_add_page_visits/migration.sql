-- CreateTable
CREATE TABLE "page_visits" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "page" TEXT NOT NULL DEFAULT 'lista-vip',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_visits_ip_page_key" ON "page_visits"("ip", "page");
