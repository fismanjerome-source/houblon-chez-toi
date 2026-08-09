-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'PARTICULIER',
    "companyName" TEXT,
    "town" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brewery" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "abv" DOUBLE PRECISION NOT NULL,
    "price33" DOUBLE PRECISION NOT NULL,
    "price75" DOUBLE PRECISION NOT NULL,
    "glassName" TEXT,
    "glassPrice" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Beer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EN_PREPARATION',
    "town" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "beerId" TEXT NOT NULL,
    "format" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "withGlass" BOOLEAN NOT NULL DEFAULT false,
    "unitPriceCents" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_beerId_fkey" FOREIGN KEY ("beerId") REFERENCES "Beer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
