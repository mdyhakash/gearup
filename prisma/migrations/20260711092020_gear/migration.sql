/*
  Warnings:

  - You are about to drop the column `isAvaiable` on the `gear_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gear_items" DROP COLUMN "isAvaiable",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
