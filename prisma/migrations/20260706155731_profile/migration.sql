/*
  Warnings:

  - You are about to drop the column `profilePhot` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "profilePhot",
ADD COLUMN     "profilePhoto" TEXT;
