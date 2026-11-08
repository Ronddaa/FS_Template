-- CreateEnum
CREATE TYPE "Setup_Status" AS ENUM ('NOT_STARTED', 'TOKEN_ISSUED', 'EMAIL_PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "installation_setup" (
    "id" INTEGER NOT NULL,
    "status" "Setup_Status" NOT NULL DEFAULT 'NOT_STARTED',
    "token_hash" CHAR(64),
    "token_expires_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "installation_setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setup_registration" (
    "id" UUID NOT NULL,
    "setup_id" INTEGER NOT NULL,
    "organization_name" VARCHAR(150) NOT NULL,
    "f_name" VARCHAR(100) NOT NULL,
    "l_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "pass_hash" VARCHAR(255) NOT NULL,
    "email_token_hash" VARCHAR(64),
    "email_token_expires_at" TIMESTAMPTZ(3),
    "email_verified_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "setup_registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "installation_setup_token_hash_key" ON "installation_setup"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "setup_registration_setup_id_key" ON "setup_registration"("setup_id");

-- AddForeignKey
ALTER TABLE "setup_registration" ADD CONSTRAINT "setup_registration_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "installation_setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
