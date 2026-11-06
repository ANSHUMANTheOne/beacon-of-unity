ALTER TABLE media ADD COLUMN backend TEXT NOT NULL DEFAULT 'd1' CHECK(backend IN ('d1','r2','b2'));
ALTER TABLE media ADD COLUMN ready INTEGER NOT NULL DEFAULT 1 CHECK(ready IN (0,1));
ALTER TABLE media ADD COLUMN object_key TEXT;
ALTER TABLE media ADD COLUMN object_version TEXT;
DROP TRIGGER media_global_quota;
DROP TRIGGER media_member_quota;
CREATE TRIGGER media_global_quota BEFORE INSERT ON media
WHEN NEW.backend='d1' AND (SELECT COALESCE(SUM(size),0) FROM media WHERE backend='d1')+NEW.size > 134217728
BEGIN SELECT RAISE(ABORT,'GLOBAL_STORAGE_LIMIT'); END;
CREATE TRIGGER media_member_quota BEFORE INSERT ON media
WHEN NEW.backend='d1' AND (SELECT COALESCE(SUM(size),0) FROM media WHERE backend='d1' AND user_id=NEW.user_id)+NEW.size > 20971520
BEGIN SELECT RAISE(ABORT,'MEMBER_STORAGE_LIMIT'); END;
-- In-progress objects reserve their full size. These atomic limits leave headroom
-- below B2's 10 GB free allowance in a dedicated account/bucket.
CREATE TRIGGER b2_global_quota BEFORE INSERT ON media
WHEN NEW.backend='b2' AND (SELECT COALESCE(SUM(size),0) FROM media WHERE backend='b2')+NEW.size > 8589934592
BEGIN SELECT RAISE(ABORT,'GLOBAL_STORAGE_LIMIT'); END;
CREATE TRIGGER b2_member_quota BEFORE INSERT ON media
WHEN NEW.backend='b2' AND (SELECT COALESCE(SUM(size),0) FROM media WHERE backend='b2' AND user_id=NEW.user_id)+NEW.size > 2147483648
BEGIN SELECT RAISE(ABORT,'MEMBER_STORAGE_LIMIT'); END;
CREATE TABLE media_uploads(
  media_id TEXT PRIMARY KEY REFERENCES media(id) ON DELETE CASCADE,
  upload_id TEXT,
  fingerprint TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'uploading' CHECK(state IN ('uploading','completing','deleting')),
  operation_until INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE upload_parts(
  media_id TEXT NOT NULL REFERENCES media_uploads(media_id) ON DELETE CASCADE,
  part INTEGER NOT NULL,
  size INTEGER NOT NULL,
  etag TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(media_id,part)
);
