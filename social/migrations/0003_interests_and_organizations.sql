ALTER TABLE users ADD COLUMN account_type TEXT NOT NULL DEFAULT 'person' CHECK(account_type IN ('person','organization'));
ALTER TABLE users ADD COLUMN interests TEXT NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN website TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN topics TEXT NOT NULL DEFAULT '[]';
