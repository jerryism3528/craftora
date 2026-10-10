-- Supporters wall entries (one row per name on the wall). Safe to run more than once.
CREATE TABLE IF NOT EXISTS wall_entries (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  level text NOT NULL DEFAULT 'supporter' CHECK (level IN ('sponsor', 'business', 'pro', 'supporter')),
  photo text,                 -- approved photo: file name in the wall folder, or a site path like /uploads/x.png
  pending_photo text,         -- photo uploaded by the backer, waiting for admin approval
  url text,                   -- sponsor website
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  email text,                 -- private, for backers without an account yet
  source text NOT NULL DEFAULT '',   -- private: kickstarter, gofundme, ko-fi, manual...
  note text NOT NULL DEFAULT '',     -- private admin note
  visible boolean NOT NULL DEFAULT true,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS wall_entries_email_idx ON wall_entries (lower(email)) WHERE email IS NOT NULL AND user_id IS NULL;
CREATE INDEX IF NOT EXISTS wall_entries_list_idx ON wall_entries (visible, level, pinned DESC, created_at);

-- Bring over supporters marked on user accounts.
INSERT INTO wall_entries (name, level, url, photo, user_id, source, visible, created_at)
SELECT COALESCE(NULLIF(u.supporter_name, ''), u.username, split_part(u.email, '@', 1)),
  CASE WHEN u.reward_tier = 'sponsor' THEN 'sponsor'
       WHEN t.plan = 'business' AND t.months IS NULL THEN 'business'
       WHEN t.plan = 'pro' AND t.months IS NULL THEN 'pro'
       ELSE 'supporter' END,
  u.sponsor_url, u.sponsor_logo, u.id, COALESCE(u.plan_source, ''), COALESCE(u.show_on_wall, true),
  COALESCE(u.supporter_since, u.created_at)
FROM users u LEFT JOIN reward_tiers t ON t.key = u.reward_tier
WHERE u.is_supporter
ON CONFLICT (user_id) DO NOTHING;

-- Bring over imported backers who have not signed up yet.
INSERT INTO wall_entries (name, level, email, source, created_at)
SELECT g.supporter_name,
  CASE WHEN g.tier = 'sponsor' THEN 'sponsor'
       WHEN t.plan = 'business' AND t.months IS NULL THEN 'business'
       WHEN t.plan = 'pro' AND t.months IS NULL THEN 'pro'
       ELSE 'supporter' END,
  lower(g.email), g.source, g.created_at
FROM plan_grants g LEFT JOIN reward_tiers t ON t.key = g.tier
WHERE g.claimed_at IS NULL AND g.supporter AND COALESCE(g.supporter_name, '') <> ''
  AND NOT EXISTS (SELECT 1 FROM wall_entries w WHERE lower(w.email) = lower(g.email));
