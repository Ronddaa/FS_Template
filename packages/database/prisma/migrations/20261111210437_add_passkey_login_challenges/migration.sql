-- CreateTable
CREATE TABLE "passkey_login_challenges" (
    "id" UUID NOT NULL,
    "challenge" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "passkey_login_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passkey_login_challenges_challenge_key" ON "passkey_login_challenges"("challenge");

-- CreateIndex
CREATE INDEX "passkey_login_challenges_expires_at_idx" ON "passkey_login_challenges"("expires_at");
