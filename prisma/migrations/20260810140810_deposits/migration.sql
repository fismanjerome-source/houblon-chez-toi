-- AlterTable
ALTER TABLE "Beer" ADD COLUMN     "depositCents33" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "depositCents75" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "depositChargedCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "depositReturnedCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "depositCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DepositReturn" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "beerId" TEXT NOT NULL,
    "format" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "creditedCents" INTEGER NOT NULL,

    CONSTRAINT "DepositReturn_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DepositReturn" ADD CONSTRAINT "DepositReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositReturn" ADD CONSTRAINT "DepositReturn_beerId_fkey" FOREIGN KEY ("beerId") REFERENCES "Beer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

