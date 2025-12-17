-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_ownerId_fkey";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
