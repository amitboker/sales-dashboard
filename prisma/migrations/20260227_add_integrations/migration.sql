-- CreateTable
CREATE TABLE IF NOT EXISTS "integrations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "apiKey" TEXT,
    "config" JSONB,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "integrations_clientId_idx" ON "integrations"("clientId");

-- CreateIndex (unique per client+provider)
CREATE UNIQUE INDEX IF NOT EXISTS "integrations_clientId_provider_key" ON "integrations"("clientId", "provider");

-- AddForeignKey
ALTER TABLE "integrations"
    ADD CONSTRAINT "integrations_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "integrations" ENABLE ROW LEVEL SECURITY;
