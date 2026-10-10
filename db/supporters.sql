-- Founding Supporters wall. Safe to run more than once.
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_wall boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sponsor_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sponsor_logo text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supporter_since timestamptz;
UPDATE users SET supporter_since = COALESCE(supporter_since, updated_at, created_at) WHERE is_supporter AND supporter_since IS NULL;
CREATE INDEX IF NOT EXISTS users_supporters_idx ON users (supporter_since) WHERE is_supporter;
