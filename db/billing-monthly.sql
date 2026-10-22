-- Craftora: one-month, non-renewing plans (pay with Google Pay, Apple Pay, PayPal, card or USDC). Safe to run more than once.
INSERT INTO billing_products (key, name, plan_key, months, price_cents, active, sort) VALUES
  ('pro-1m', 'Pro for 1 month', 'pro', 1, 500, true, -2),
  ('business-1m', 'Business for 1 month', 'business', 1, 1500, true, -1)
ON CONFLICT (key) DO NOTHING;
