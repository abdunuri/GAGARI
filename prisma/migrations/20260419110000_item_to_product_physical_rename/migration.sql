-- Physical DB rename: Item -> Product, OrderItem -> OrderProduct, itemId -> productId
ALTER TABLE "Item" RENAME TO "Product";
ALTER TABLE "OrderItem" RENAME TO "OrderProduct";
ALTER TABLE "OrderProduct" RENAME COLUMN "itemId" TO "productId";
