-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentChoice" TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

