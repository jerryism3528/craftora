-- Craftora admin portal: plans, reward tiers, plan grants. Safe to run more than once.

CREATE TABLE IF NOT EXISTS plans (
  key text PRIMARY KEY,
  name text NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1,
  tool_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  storage_mb integer NOT NULL DEFAULT 1024,
  seats integer NOT NULL DEFAULT 1,
  white_label boolean NOT NULL DEFAULT false,
  ad_free boolean NOT NULL DEFAULT false,
  rank integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#64748b'
);

INSERT INTO plans (key, name, multiplier, tool_overrides, storage_mb, seats, white_label, ad_free, rank, color) VALUES
  ('free', 'Free', 1, '{}', 1024, 1, false, false, 0, '#64748b'),
  ('pro', 'Pro', 5, '{"seo-site-audit": 15, "document-signer": 50}', 5120, 1, false, true, 1, '#4f46e5'),
  ('business', 'Business', 10, '{"seo-site-audit": 40, "document-signer": 500}', 10240, 3, true, true, 2, '#0d9488')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS reward_tiers (
  key text PRIMARY KEY,
  name text NOT NULL,
  price_usd integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'free',
  months integer,               -- NULL means lifetime
  supporter boolean NOT NULL DEFAULT true,
  max_backers integer,
  extras text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);

INSERT INTO reward_tiers (key, name, price_usd, plan, months, supporter, max_backers, extras, sort) VALUES
  ('supporter', 'Supporter', 9, 'pro', 3, true, NULL, 'Supporters wall and badge', 1),
  ('pro-1y', 'Pro 1 Year', 19, 'pro', 12, true, NULL, '', 2),
  ('lifetime-pro-early', 'Lifetime Pro (Early Bird)', 49, 'pro', NULL, true, 250, 'Early access, roadmap vote', 3),
  ('lifetime-pro', 'Lifetime Pro', 69, 'pro', NULL, true, 500, 'Early access, roadmap vote', 4),
  ('lifetime-business', 'Lifetime Business', 179, 'business', NULL, true, 100, '', 5),
  ('seo-report', 'Expert SEO Report', 349, 'business', NULL, true, 20, 'Written SEO report of backer site', 6),
  ('sponsor', 'Sponsor', 599, 'business', NULL, true, 5, 'Logo placement for 12 months', 7)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_source text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_tier text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_supporter boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supporter_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_note text;

-- Plans for people who have no account yet (for example Kickstarter backers). Claimed automatically when they sign up.
CREATE TABLE IF NOT EXISTS plan_grants (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  plan text NOT NULL,
  months integer,
  tier text,
  supporter boolean NOT NULL DEFAULT false,
  supporter_name text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  claimed_user uuid
);
CREATE UNIQUE INDEX IF NOT EXISTS plan_grants_open_email ON plan_grants (lower(email)) WHERE claimed_at IS NULL;
CREATE INDEX IF NOT EXISTS users_plan_idx ON users (plan) WHERE plan <> 'free';
CREATE INDEX IF NOT EXISTS usage_log_time_idx ON usage_log (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status, created_at DESC);
