-- Small private media for the free-tier pilot. No public bucket or billing required.
CREATE TABLE media_chunks(media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,part INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(media_id,part));
CREATE TRIGGER media_global_quota BEFORE INSERT ON media
WHEN (SELECT COALESCE(SUM(size),0) FROM media)+NEW.size > 134217728
BEGIN SELECT RAISE(ABORT,'GLOBAL_STORAGE_LIMIT'); END;
CREATE TRIGGER media_member_quota BEFORE INSERT ON media
WHEN (SELECT COALESCE(SUM(size),0) FROM media WHERE user_id=NEW.user_id)+NEW.size > 20971520
BEGIN SELECT RAISE(ABORT,'MEMBER_STORAGE_LIMIT'); END;
