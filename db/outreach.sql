-- Step 17: cold email outreach (sending runs from Craftora, triggered by n8n). Safe to run more than once.

CREATE TABLE IF NOT EXISTS outreach_segments (
  key text PRIMARY KEY,
  name text NOT NULL,
  inbox_email text NOT NULL,
  from_name text NOT NULL DEFAULT 'Maria V.',
  promo_code text,
  daily_cap integer NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT false,
  last_sent_at timestamptz,
  next_send_at timestamptz,
  sort integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS outreach_templates (
  segment text NOT NULL REFERENCES outreach_segments(key) ON DELETE CASCADE,
  step integer NOT NULL CHECK (step BETWEEN 1 AND 5),
  delay_days integer NOT NULL DEFAULT 0,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (segment, step)
);

CREATE TABLE IF NOT EXISTS outreach_leads (
  id bigserial PRIMARY KEY,
  segment text NOT NULL REFERENCES outreach_segments(key),
  email text NOT NULL UNIQUE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  tz text NOT NULL DEFAULT 'America/New_York',
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'new',
  step integer NOT NULL DEFAULT 0,
  verify text,
  message_id text,
  subject text,
  first_sent_at timestamptz,
  last_sent_at timestamptz,
  replied_at timestamptz,
  clicked_at timestamptz,
  stop_reason text,
  batch text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS outreach_leads_due_idx ON outreach_leads (segment, status, step, last_sent_at);

CREATE TABLE IF NOT EXISTS outreach_events (
  id bigserial PRIMARY KEY,
  lead_id bigint REFERENCES outreach_leads(id) ON DELETE CASCADE,
  segment text,
  type text NOT NULL,
  step integer,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS outreach_events_lead_idx ON outreach_events (lead_id, created_at);
CREATE INDEX IF NOT EXISTS outreach_events_type_idx ON outreach_events (type, created_at);

-- Never email these addresses or domains again.
CREATE TABLE IF NOT EXISTS outreach_suppress (
  value text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  paused boolean NOT NULL DEFAULT false,
  window_start integer NOT NULL DEFAULT 9,
  window_end integer NOT NULL DEFAULT 11,
  weekdays_only boolean NOT NULL DEFAULT true,
  gap_min integer NOT NULL DEFAULT 6,
  gap_max integer NOT NULL DEFAULT 14,
  new_per_day_share integer NOT NULL DEFAULT 60
);
ALTER TABLE outreach_settings ADD COLUMN IF NOT EXISTS lock_until timestamptz;
INSERT INTO outreach_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO outreach_segments (key, name, inbox_email, promo_code, sort) VALUES
  ('law', 'Law firms', 'maria@craftorapro.com', 'LAW50', 1),
  ('cpa', 'Accounting and tax firms', 'maria.v@craftorapro.com', 'CPA50', 2),
  ('hr', 'HR and recruiting', 'maria@craftora-tools.com', 'HR50', 3),
  ('deal', 'Real estate and insurance', 'maria.v@craftora-tools.com', 'DEAL50', 4)
ON CONFLICT (key) DO NOTHING;

-- Starting templates. Edit them any time in admin > Outreach. {first_name}, {company}, {code},
-- {tools_link} and {pricing_link} are filled in for each person.
INSERT INTO outreach_templates (segment, step, delay_days, subject, body) VALUES
('law', 1, 0, 'client files on free PDF sites', $$Hi {first_name},

Quick question: when someone at {company} merges or compresses a client PDF, where does that file go?

Most free PDF sites upload it to their servers first. For a law firm, that means client documents sitting on a stranger's server.

I built Craftora so that doesn't happen. Merge, split, compress, protect, watermark and sign run entirely in your browser, so the file never leaves your computer.

Here is the list: {tools_link}

Maria V.
Founder, Craftora

P.S. Not relevant for you? Reply no and I won't email again.$$),
('law', 2, 3, '', $$Hi {first_name}, one more thought. Many firms have a rule against uploading client files to outside sites, but staff still use them because they are quick. Craftora gives your team the same speed without the upload. If it helps, I can set up an account for {company}. Just reply.

Maria V.$$),
('law', 3, 8, '', $$Hi {first_name}, last note from me. If your team needs more than the free daily limit (bigger files, unlimited use, document signing), code {code} takes 50% off the first 3 months: {pricing_link}

If it's not a fit, no problem. Reply no and I won't email again.

Maria V.$$),

('cpa', 1, 0, 'tax files on free PDF sites', $$Hi {first_name},

Quick question: when someone at {company} merges a client's tax documents or compresses a bank statement, where does that file go?

Most free PDF sites upload it to their servers first. For an accounting firm, that means returns, statements and payroll sitting on a stranger's server.

I built Craftora so that doesn't happen. Merge, split, compress, protect and sign run entirely in your browser, and receipts can be turned into PDFs the same way. The file never leaves your computer.

Here is the list: {tools_link}

Maria V.
Founder, Craftora

P.S. Not relevant for you? Reply no and I won't email again.$$),
('cpa', 2, 3, '', $$Hi {first_name}, one more thought. Tax season means a lot of PDFs moving around fast, and that is usually when staff reach for whatever free site is quickest. Craftora gives your team the same speed without uploading client files. If it helps, I can set up an account for {company}. Just reply.

Maria V.$$),
('cpa', 3, 8, '', $$Hi {first_name}, last note from me. If your team needs more than the free daily limit (bigger files, unlimited use, document signing), code {code} takes 50% off the first 3 months: {pricing_link}

If it's not a fit, no problem. Reply no and I won't email again.

Maria V.$$),

('hr', 1, 0, 'resumes on free PDF sites', $$Hi {first_name},

Quick question: when someone at {company} merges a candidate's resume and ID scan, or compresses an offer letter, where does that file go?

Most free PDF sites upload it to their servers first. For HR and recruiting, that means personal data sitting on a stranger's server.

I built Craftora so that doesn't happen. Merge, split, compress, protect, watermark and sign run entirely in your browser, so the file never leaves your computer.

Here is the list: {tools_link}

Maria V.
Founder, Craftora

P.S. Not relevant for you? Reply no and I won't email again.$$),
('hr', 2, 3, '', $$Hi {first_name}, one more thought. Most teams have a policy against uploading candidate data to outside sites, but recruiters still use them because they are quick. Craftora gives your team the same speed without the upload. If it helps, I can set up an account for {company}. Just reply.

Maria V.$$),
('hr', 3, 8, '', $$Hi {first_name}, last note from me. If your team needs more than the free daily limit (bigger files, unlimited use, document signing), code {code} takes 50% off the first 3 months: {pricing_link}

If it's not a fit, no problem. Reply no and I won't email again.

Maria V.$$),

('deal', 1, 0, 'client documents on free PDF sites', $$Hi {first_name},

Quick question: when someone at {company} merges a purchase contract or compresses a client's bank statement, where does that file go?

Most free PDF sites upload it to their servers first. For real estate and insurance, that means contracts, IDs and financial records sitting on a stranger's server.

I built Craftora so that doesn't happen. Merge, split, compress, protect and sign run entirely in your browser, and photos of documents can be turned into PDFs the same way. The file never leaves your computer.

Here is the list: {tools_link}

Maria V.
Founder, Craftora

P.S. Not relevant for you? Reply no and I won't email again.$$),
('deal', 2, 3, '', $$Hi {first_name}, one more thought. Deals move fast and agents grab whatever free PDF site is quickest, often from their phone. Craftora gives your team the same speed without uploading client files. If it helps, I can set up an account for {company}. Just reply.

Maria V.$$),
('deal', 3, 8, '', $$Hi {first_name}, last note from me. If your team needs more than the free daily limit (bigger files, unlimited use, document signing), code {code} takes 50% off the first 3 months: {pricing_link}

If it's not a fit, no problem. Reply no and I won't email again.

Maria V.$$)
ON CONFLICT (segment, step) DO NOTHING;

SELECT 'outreach segments' AS what, count(*) FROM outreach_segments
UNION ALL SELECT 'outreach templates', count(*) FROM outreach_templates;
