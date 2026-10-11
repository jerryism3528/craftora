-- Craftora billing: PayPal subscriptions. Safe to run more than once.

-- Prices we sell, and the PayPal plan created for each one (separately for sandbox and live).
CREATE TABLE IF NOT EXISTS billing_plans (
  id serial PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('sandbox', 'live')),
  plan_key text NOT NULL,                 -- pro | business (matches plans.key)
  billing_interval text NOT NULL CHECK (billing_interval IN ('month', 'year')),
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  paypal_product_id text,
  paypal_plan_id text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mode, plan_key, billing_interval)
);

INSERT INTO billing_plans (mode, plan_key, billing_interval, price_cents) VALUES
  ('sandbox', 'pro', 'month', 500), ('sandbox', 'pro', 'year', 4800),
  ('sandbox', 'business', 'month', 1500), ('sandbox', 'business', 'year', 14400),
  ('live', 'pro', 'month', 500), ('live', 'pro', 'year', 4800),
  ('live', 'business', 'month', 1500), ('live', 'business', 'year', 14400)
ON CONFLICT (mode, plan_key, billing_interval) DO NOTHING;

CREATE TABLE IF NOT EXISTS subscriptions (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  paypal_subscription_id text NOT NULL UNIQUE,
  mode text NOT NULL,
  plan_key text NOT NULL,
  billing_interval text NOT NULL,
  price_cents integer,
  status text NOT NULL DEFAULT 'APPROVAL_PENDING',
  payer_email text,
  paid_through timestamptz,               -- next billing time reported by PayPal
  last_payment_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON subscriptions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions (status, paid_through);

CREATE TABLE IF NOT EXISTS billing_payments (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  paypal_subscription_id text,
  paypal_txn_id text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'payment',   -- payment | refund
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text,
  mode text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS billing_payments_time_idx ON billing_payments (created_at DESC);

CREATE TABLE IF NOT EXISTS billing_events (
  id bigserial PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  resource_id text,
  mode text NOT NULL,
  payload jsonb,
  processed boolean NOT NULL DEFAULT false,
  error text,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS billing_events_time_idx ON billing_events (received_at DESC);
