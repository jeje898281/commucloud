/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `resident` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "resident" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "resident_email_key" ON "resident"("email");
