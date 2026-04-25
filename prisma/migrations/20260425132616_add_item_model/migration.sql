-- DropForeignKey
ALTER TABLE "Bakery" DROP CONSTRAINT "Bakery_ownerId_fkey";

-- AlterTable
ALTER TABLE "OrderProduct" RENAME CONSTRAINT "OrderItem_pkey" TO "OrderProduct_pkey";

-- AlterTable
ALTER TABLE "Product" RENAME CONSTRAINT "Item_pkey" TO "Product_pkey";

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- RenameForeignKey
ALTER TABLE "OrderProduct" RENAME CONSTRAINT "OrderItem_itemId_fkey" TO "OrderProduct_productId_fkey";

-- RenameForeignKey
ALTER TABLE "OrderProduct" RENAME CONSTRAINT "OrderItem_orderId_fkey" TO "OrderProduct_orderId_fkey";

-- RenameForeignKey
ALTER TABLE "Product" RENAME CONSTRAINT "Item_bakeryId_fkey" TO "Product_bakeryId_fkey";

-- RenameForeignKey
ALTER TABLE "Product" RENAME CONSTRAINT "Item_createdById_fkey" TO "Product_createdById_fkey";

-- AddForeignKey
ALTER TABLE "Bakery" ADD CONSTRAINT "Bakery_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "OrderItem_itemId_orderId_key" RENAME TO "OrderProduct_productId_orderId_key";
