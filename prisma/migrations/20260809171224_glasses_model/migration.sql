-- AlterTable
ALTER TABLE "Beer" DROP COLUMN "glassImageUrl",
DROP COLUMN "glassName",
DROP COLUMN "glassPrice",
ADD COLUMN     "tastingNote" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "withGlass",
ADD COLUMN     "glassId" TEXT;

-- CreateTable
CREATE TABLE "Glass" (
    "id" TEXT NOT NULL,
    "beerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "volumeCl" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Glass_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Glass" ADD CONSTRAINT "Glass_beerId_fkey" FOREIGN KEY ("beerId") REFERENCES "Beer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_glassId_fkey" FOREIGN KEY ("glassId") REFERENCES "Glass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

