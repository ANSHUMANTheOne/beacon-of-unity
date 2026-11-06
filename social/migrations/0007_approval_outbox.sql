CREATE TABLE approval_outbox (
  user_id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','sending','accepted','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt INTEGER NOT NULL,
  lease_until INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  accepted_at INTEGER,
  last_error TEXT
);
CREATE INDEX approval_due ON approval_outbox(status,next_attempt);
