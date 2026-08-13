/*
  Warnings:

  - A unique constraint covering the columns `[registration_code_hash]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "registration_code_hash" CHAR(64),
ADD COLUMN     "registration_code_updated_at" TIMESTAMPTZ(3);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_registration_code_hash_key" ON "organizations"("registration_code_hash");
