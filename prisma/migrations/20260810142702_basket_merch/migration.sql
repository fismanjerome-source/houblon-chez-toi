-- CreateTable
CREATE TABLE "Basket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Le panier de la quinzaine',
    "description" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MerchProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderExtra" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,

    CONSTRAINT "OrderExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BasketBeers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BasketBeers_AB_unique" ON "_BasketBeers"("A", "B");

-- CreateIndex
CREATE INDEX "_BasketBeers_B_index" ON "_BasketBeers"("B");

-- AddForeignKey
ALTER TABLE "OrderExtra" ADD CONSTRAINT "OrderExtra_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BasketBeers" ADD CONSTRAINT "_BasketBeers_A_fkey" FOREIGN KEY ("A") REFERENCES "Basket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BasketBeers" ADD CONSTRAINT "_BasketBeers_B_fkey" FOREIGN KEY ("B") REFERENCES "Beer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

