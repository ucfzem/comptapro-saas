-- Activer l'extension vectorielle pour le RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Row-Level Security pour l'isolation multi-tenant
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Fonction utilitaire pour récupérer le tenant_id depuis le contexte de session
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
  SELECT nullif(current_setting('app.current_tenant_id', true), '')::text;
$$ LANGUAGE sql STABLE;

-- Politiques d'isolation
CREATE POLICY tenant_isolation_journal ON "JournalEntry" 
  FOR ALL USING ("tenantId" = current_tenant_id());

CREATE POLICY tenant_isolation_accounts ON "Account" 
  FOR ALL USING ("tenantId" = current_tenant_id());

CREATE POLICY tenant_isolation_clients ON "Client" 
  FOR ALL USING ("tenantId" = current_tenant_id());

CREATE POLICY tenant_isolation_documents ON "Document" 
  FOR ALL USING ("tenantId" = current_tenant_id());

CREATE POLICY tenant_isolation_audit ON "AuditLog" 
  FOR ALL USING ("tenantId" = current_tenant_id());

-- Table RAG pour les documents juridiques
CREATE TABLE IF NOT EXISTS "rag_documents" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx ON "rag_documents" 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
