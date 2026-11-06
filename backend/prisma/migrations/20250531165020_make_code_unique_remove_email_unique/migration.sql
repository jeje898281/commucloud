/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `resident` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "resident_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "resident_code_key" ON "resident"("code");
