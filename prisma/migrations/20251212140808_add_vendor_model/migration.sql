-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stock_level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vendor_id" INTEGER;

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "avatar" TEXT,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "response_time" INTEGER NOT NULL DEFAULT 0,
    "fulfillment_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "vendors"("email");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
