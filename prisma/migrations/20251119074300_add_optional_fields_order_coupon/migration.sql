-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "current_usage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "min_order" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "coupon_id" INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discount" INTEGER DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
