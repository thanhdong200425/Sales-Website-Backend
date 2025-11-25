/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `colors` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "colors",
DROP COLUMN "discount",
DROP COLUMN "image",
DROP COLUMN "originalPrice",
DROP COLUMN "rating",
DROP COLUMN "sizes",
DROP COLUMN "style",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published',
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
