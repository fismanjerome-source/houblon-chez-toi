-- AlterTable
ALTER TABLE "Basket" ADD COLUMN     "descriptionNl" TEXT;

-- AlterTable
ALTER TABLE "Beer" ADD COLUMN     "appearanceNl" TEXT,
ADD COLUMN     "aromaNl" TEXT,
ADD COLUMN     "brewHistoryNl" TEXT,
ADD COLUMN     "descriptionNl" TEXT,
ADD COLUMN     "foodPairingNl" TEXT,
ADD COLUMN     "originNl" TEXT,
ADD COLUMN     "servingTempNl" TEXT,
ADD COLUMN     "shortHistoryNl" TEXT,
ADD COLUMN     "tasteNl" TEXT,
ADD COLUMN     "tastingNoteNl" TEXT;

-- AlterTable
ALTER TABLE "MerchProduct" ADD COLUMN     "descriptionNl" TEXT;

