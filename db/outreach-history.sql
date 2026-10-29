-- Step 18: keep the text of every outreach email for the per-lead history. Safe to run more than once.
ALTER TABLE outreach_events ADD COLUMN IF NOT EXISTS body text;
SELECT 'outreach history ready' AS status;
