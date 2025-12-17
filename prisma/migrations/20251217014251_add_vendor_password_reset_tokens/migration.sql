-- CreateTable
CREATE TABLE "vendor_password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_password_reset_tokens_token_key" ON "vendor_password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "vendor_password_reset_tokens_token_idx" ON "vendor_password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "vendor_password_reset_tokens_vendor_id_idx" ON "vendor_password_reset_tokens"("vendor_id");

-- AddForeignKey
ALTER TABLE "vendor_password_reset_tokens" ADD CONSTRAINT "vendor_password_reset_tokens_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
