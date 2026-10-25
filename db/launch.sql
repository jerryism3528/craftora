-- Step 17: daily limits on browser tools, launch codes. Safe to run more than once.

-- 1. Browser tool limits: anon_limit = visitors (no account), daily_limit = free accounts.
INSERT INTO tool_limits (tool_slug, daily_limit, batch_limit, anon_limit, enabled)
SELECT s, 5, NULL, 3, true FROM unnest(ARRAY[
  'merge-pdf','split-pdf','compress-pdf','pdf-to-jpg','jpg-to-pdf','rotate-pdf','organize-pdf',
  'add-page-numbers','watermark-pdf','protect-pdf','unlock-pdf','sign-pdf',
  'compress-image','resize-image','crop-image','convert-image','rotate-image','image-to-text','image-upscaler'
]) AS s
ON CONFLICT (tool_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_usage_device_tool_time ON usage_log (device_id, tool_slug, created_at) WHERE device_id IS NOT NULL;

-- 2. Launch codes.
CREATE TABLE IF NOT EXISTS promo_codes (
  code text PRIMARY KEY,
  percent integer NOT NULL CHECK (percent BETWEEN 1 AND 100),
  months integer NOT NULL DEFAULT 3 CHECK (months BETWEEN 1 AND 24),
  max_uses integer,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id bigserial PRIMARY KEY,
  code text NOT NULL REFERENCES promo_codes(code) ON UPDATE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('subscription', 'order')),
  ref text NOT NULL UNIQUE,
  base_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS promo_redemptions_code_idx ON promo_redemptions (code, status);
CREATE INDEX IF NOT EXISTS promo_redemptions_user_idx ON promo_redemptions (user_id, status);

-- PayPal plans that bill the discounted price first, then the normal price.
CREATE TABLE IF NOT EXISTS billing_promo_plans (
  id serial PRIMARY KEY,
  mode text NOT NULL,
  plan_key text NOT NULL,
  billing_interval text NOT NULL,
  percent integer NOT NULL,
  promo_months integer NOT NULL,
  base_cents integer NOT NULL,
  trial_cents integer NOT NULL,
  trial_cycles integer NOT NULL,
  paypal_plan_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE billing_orders ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE billing_orders ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0;

INSERT INTO promo_codes (code, percent, months, note) VALUES
  ('LAW50', 50, 3, 'Outreach: law firms (maria@craftorapro.com)'),
  ('CPA50', 50, 3, 'Outreach: accounting and tax firms (maria.v@craftorapro.com)'),
  ('HR50', 50, 3, 'Outreach: HR and recruiting (maria@craftora-tools.com)'),
  ('DEAL50', 50, 3, 'Outreach: real estate and insurance (maria.v@craftora-tools.com)')
ON CONFLICT (code) DO NOTHING;

SELECT 'browser limits' AS what, count(*) FROM tool_limits WHERE anon_limit > 0
UNION ALL SELECT 'launch codes', count(*) FROM promo_codes;
