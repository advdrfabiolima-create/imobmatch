-- Adiciona colunas que faltam na tabela opportunities
-- Usa IF NOT EXISTS para ser idempotente (seguro rodar múltiplas vezes)

ALTER TABLE "opportunities"
  ADD COLUMN IF NOT EXISTS "status"     TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS "photoUrl"   TEXT,
  ADD COLUMN IF NOT EXISTS "propertyId" TEXT;
