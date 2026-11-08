/*
  Warnings:

  - A unique constraint covering the columns `[email_token_hash]` on the table `setup_registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `setup_registration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "setup_registration" DROP CONSTRAINT "setup_registration_setup_id_fkey";

-- AlterTable
ALTER TABLE "setup_registration" ADD COLUMN     "email_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expires_at" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "email_token_hash" SET DATA TYPE CHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "setup_registration_email_token_hash_key" ON "setup_registration"("email_token_hash");

-- AddForeignKey
ALTER TABLE "setup_registration" ADD CONSTRAINT "setup_registration_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "installation_setup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Only one installation setup record is allowed.
ALTER TABLE "installation_setup"
ADD CONSTRAINT "installation_setup_singleton_check"
CHECK ("id" = 1);

-- Only one organization is allowed per CRM installation.
CREATE UNIQUE INDEX "organizations_single_installation_key"
ON "organizations" ((1));