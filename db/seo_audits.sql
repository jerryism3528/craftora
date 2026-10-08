CREATE TABLE IF NOT EXISTS seo_audits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  site TEXT NOT NULL,
  start_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  score INT,
  pages INT,
  summary JSONB,
  report JSONB,
  error TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS seo_audits_user_idx ON seo_audits (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS seo_audits_site_idx ON seo_audits (user_id, site, created_at DESC);
INSERT INTO tool_limits (tool_slug, daily_limit, batch_limit, anon_limit, enabled)
SELECT 'seo-site-audit', 3, NULL, 0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM tool_limits WHERE tool_slug = 'seo-site-audit');
SELECT tool_slug, daily_limit, enabled FROM tool_limits WHERE tool_slug = 'seo-site-audit';
