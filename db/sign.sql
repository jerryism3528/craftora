CREATE TABLE IF NOT EXISTS sign_docs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  pages INT NOT NULL,
  size_bytes INT NOT NULL,
  original_sha256 TEXT NOT NULL,
  final_sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  message TEXT NOT NULL DEFAULT '',
  ordered BOOLEAN NOT NULL DEFAULT FALSE,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS sign_docs_user_idx ON sign_docs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sign_docs_final_hash_idx ON sign_docs (final_sha256);

CREATE TABLE IF NOT EXISTS sign_signers (
  id SERIAL PRIMARY KEY,
  doc_id TEXT NOT NULL REFERENCES sign_docs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position INT NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#6366f1',
  token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  declined_reason TEXT,
  ip TEXT,
  user_agent TEXT,
  reminded_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS sign_signers_doc_idx ON sign_signers (doc_id);

CREATE TABLE IF NOT EXISTS sign_fields (
  id SERIAL PRIMARY KEY,
  doc_id TEXT NOT NULL REFERENCES sign_docs(id) ON DELETE CASCADE,
  signer_id INT NOT NULL REFERENCES sign_signers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  page INT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  w REAL NOT NULL,
  h REAL NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  label TEXT NOT NULL DEFAULT '',
  value TEXT
);
CREATE INDEX IF NOT EXISTS sign_fields_doc_idx ON sign_fields (doc_id);

CREATE TABLE IF NOT EXISTS sign_events (
  id SERIAL PRIMARY KEY,
  doc_id TEXT NOT NULL REFERENCES sign_docs(id) ON DELETE CASCADE,
  signer_id INT,
  event TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sign_events_doc_idx ON sign_events (doc_id, created_at);

INSERT INTO tool_limits (tool_slug, daily_limit, batch_limit, anon_limit, enabled)
SELECT 'document-signer', 10, NULL, 0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM tool_limits WHERE tool_slug = 'document-signer');
SELECT tool_slug, daily_limit, enabled FROM tool_limits WHERE tool_slug = 'document-signer';
