-- Craftora one-time purchases (PayPal, card, Apple Pay, Google Pay). Safe to run more than once.

CREATE TABLE IF NOT EXISTS billing_products (
  key text PRIMARY KEY,
  name text NOT NULL,
  plan_key text NOT NULL,          -- pro | business
  months integer,                  -- NULL means lifetime
  price_cents integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0
);

INSERT INTO billing_products (key, name, plan_key, months, price_cents, active, sort) VALUES
  ('pro-1y', 'Pro for 1 year', 'pro', 12, 4800, true, 1),
  ('business-1y', 'Business for 1 year', 'business', 12, 14400, true, 2),
  ('lifetime-pro', 'Lifetime Pro', 'pro', NULL, 6900, false, 3),
  ('lifetime-business', 'Lifetime Business', 'business', NULL, 17900, false, 4)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS billing_orders (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  paypal_order_id text NOT NULL UNIQUE,
  product_key text NOT NULL,
  plan_key text NOT NULL,
  months integer,
  amount_cents integer NOT NULL,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'CREATED',  -- CREATED | COMPLETED | FAILED
  capture_id text,
  payment_source text,                     -- paypal | card | apple_pay | google_pay | venmo
  payer_email text,
  fulfilled_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS billing_orders_user_idx ON billing_orders (user_id, created_at DESC);
