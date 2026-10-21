-- Craftora: USDC payments through Coinbase Business. Safe to run more than once.
ALTER TABLE billing_orders ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'paypal';
ALTER TABLE billing_orders ADD COLUMN IF NOT EXISTS external_ref text;
CREATE UNIQUE INDEX IF NOT EXISTS billing_orders_external_ref_idx ON billing_orders (external_ref) WHERE external_ref IS NOT NULL;
