-- AlterTable
ALTER TABLE "owner_passkey_enrollments" ADD COLUMN     "registration_challenge" TEXT;

-- CreateTable
CREATE TABLE "user_passkey" (
    "credential_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "public_key" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "device_type" VARCHAR(32) NOT NULL,
    "backed_up" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_passkey_pkey" PRIMARY KEY ("credential_id")
);

-- CreateIndex
CREATE INDEX "user_passkey_user_id_idx" ON "user_passkey"("user_id");

-- AddForeignKey
ALTER TABLE "user_passkey" ADD CONSTRAINT "user_passkey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
