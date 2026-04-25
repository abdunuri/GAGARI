/*
  Warnings:

  - Added the required column `bakeryId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "bakeryId" INTEGER NOT NULL,
ADD COLUMN     "createdById" TEXT NOT NULL;
