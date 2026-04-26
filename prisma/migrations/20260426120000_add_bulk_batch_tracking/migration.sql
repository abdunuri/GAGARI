-- CreateTable
CREATE TABLE "production"."BulkBatch" (
    "id" TEXT NOT NULL,
    "expectedCount" INTEGER NOT NULL,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkBatch_pkey" PRIMARY KEY ("id")
);
