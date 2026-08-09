-- AlterTable
ALTER TABLE "Beer" ADD COLUMN     "isBeerOfMonth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "learnMoreUrl" TEXT,
ADD COLUMN     "shortHistory" TEXT;
