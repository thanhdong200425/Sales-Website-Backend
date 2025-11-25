/*
  Warnings:

  - Made the column `rating` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `style` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" INTEGER,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "style" SET NOT NULL,
ALTER COLUMN "style" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
