-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cartSummary" TEXT,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "total" DECIMAL(10,2);
