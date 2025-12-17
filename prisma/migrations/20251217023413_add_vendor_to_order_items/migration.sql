-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "vendor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
