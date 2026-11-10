/*
  Warnings:

  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "setup_registration" ADD COLUMN     "phone" VARCHAR(16);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" VARCHAR(16) NOT NULL;
