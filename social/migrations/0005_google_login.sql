CREATE TABLE google_identities (
  subject TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);
CREATE TABLE oauth_states (
  state_hash TEXT PRIMARY KEY,
  browser_hash TEXT NOT NULL,
  verifier TEXT NOT NULL,
  nonce_hash TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_hash TEXT,
  expires_at INTEGER NOT NULL
);
CREATE TABLE oauth_enrollments (
  browser_hash TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
