CREATE TABLE IF NOT EXISTS handoffs (
  id              TEXT PRIMARY KEY,
  project         TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  tags            TEXT,
  from_client     TEXT NOT NULL,
  from_client_ver TEXT,
  from_model      TEXT,
  to_client       TEXT,
  to_client_ver   TEXT,
  to_model        TEXT,
  parent_id       TEXT,
  created_at      INTEGER NOT NULL,
  loaded_at       INTEGER,
  status          TEXT NOT NULL DEFAULT 'open',
  FOREIGN KEY (parent_id) REFERENCES handoffs(id)
);

CREATE INDEX IF NOT EXISTS idx_handoffs_project ON handoffs(project, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_handoffs_status ON handoffs(status);
CREATE INDEX IF NOT EXISTS idx_handoffs_parent ON handoffs(parent_id);

CREATE VIRTUAL TABLE IF NOT EXISTS handoffs_fts USING fts5(
  id UNINDEXED,
  title,
  content,
  tags,
  content='handoffs',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS handoffs_ai AFTER INSERT ON handoffs BEGIN
  INSERT INTO handoffs_fts(rowid, id, title, content, tags)
  VALUES (new.rowid, new.id, new.title, new.content, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS handoffs_ad AFTER DELETE ON handoffs BEGIN
  INSERT INTO handoffs_fts(handoffs_fts, rowid, id, title, content, tags)
  VALUES ('delete', old.rowid, old.id, old.title, old.content, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS handoffs_au AFTER UPDATE ON handoffs BEGIN
  INSERT INTO handoffs_fts(handoffs_fts, rowid, id, title, content, tags)
  VALUES ('delete', old.rowid, old.id, old.title, old.content, old.tags);
  INSERT INTO handoffs_fts(rowid, id, title, content, tags)
  VALUES (new.rowid, new.id, new.title, new.content, new.tags);
END;
