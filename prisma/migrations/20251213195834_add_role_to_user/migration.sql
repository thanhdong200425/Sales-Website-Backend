/*
Warnings:

- Added the required column `ownerId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- AddForeignKey
ALTER TABLE "products"
ADD CONSTRAINT "products_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;