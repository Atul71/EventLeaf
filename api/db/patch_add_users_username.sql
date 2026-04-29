-- Adds `users.username` for databases initialized before signup/auth stored usernames.
-- Safe to run multiple times (IF NOT EXISTS / only updates NULL usernames).

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Backfill: local-part of email + short id suffix so values stay unique and match [a-z0-9_]+
UPDATE users
SET username = LEFT(
  regexp_replace(split_part(lower(trim(email)), '@', 1), '[^a-z0-9_]', '_', 'g')
  || '_' || substring(replace(id::text, '-', ''), 1, 8),
  50
)
WHERE username IS NULL;

ALTER TABLE users ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
