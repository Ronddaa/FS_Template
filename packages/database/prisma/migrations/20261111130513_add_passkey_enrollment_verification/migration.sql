/*
  Warnings:

  - A unique constraint covering the columns `[request_hash]` on the table `owner_passkey_enrollments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[grant_hash]` on the table `owner_passkey_enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "owner_passkey_enrollments" ADD COLUMN     "grant_expires_at" TIMESTAMPTZ(3),
ADD COLUMN     "grant_hash" CHAR(64),
ADD COLUMN     "request_hash" CHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "owner_passkey_enrollments_request_hash_key" ON "owner_passkey_enrollments"("request_hash");

-- CreateIndex
CREATE UNIQUE INDEX "owner_passkey_enrollments_grant_hash_key" ON "owner_passkey_enrollments"("grant_hash");
