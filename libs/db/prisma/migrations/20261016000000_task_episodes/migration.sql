BEGIN;

ALTER TYPE task_type ADD VALUE 'IMPORT';
ALTER TYPE task_type ADD VALUE 'BATCH_IMPORT';
CREATE TABLE task_episodes (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES download_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  episode_id INTEGER REFERENCES episodes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  position INTEGER NOT NULL,
  source_path TEXT,
  import_path TEXT,
  file_path TEXT,
  nfo_path TEXT,
  jellyfin_episode_id TEXT,
  UNIQUE(task_id, episode_id),
  UNIQUE(task_id, position)
);
CREATE INDEX task_episodes_episode_id_idx ON task_episodes(episode_id);
COMMENT ON TABLE task_episodes IS E'@omit create,update,delete';
INSERT INTO task_episodes(task_id, episode_id, position, import_path, file_path, nfo_path, jellyfin_episode_id)
SELECT id, episode_id, 0, import_path, file_path, nfo_path, jellyfin_episode_id FROM download_jobs;
ALTER TABLE download_jobs DROP COLUMN episode_id, DROP COLUMN import_path,
  DROP COLUMN file_path, DROP COLUMN nfo_path, DROP COLUMN jellyfin_episode_id;

-- 单集投影保留已有查询字段；所有关联及产物只存放在 task_episodes。
CREATE FUNCTION episodes_tasks(e episodes) RETURNS SETOF download_jobs
LANGUAGE sql STABLE AS $$
  SELECT t.* FROM download_jobs t WHERE EXISTS (
    SELECT 1 FROM task_episodes te WHERE te.task_id=t.id AND te.episode_id=e.id
  )
$$;
COMMENT ON FUNCTION episodes_tasks(episodes) IS E'@fieldName tasksByEpisodeId\n@sortable\n@filterable';
CREATE FUNCTION download_jobs_episode(t download_jobs) RETURNS episodes
LANGUAGE sql STABLE AS $$
  SELECT e.* FROM task_episodes te JOIN episodes e ON e.id=te.episode_id
  WHERE te.task_id=t.id ORDER BY te.position LIMIT 1
$$;
COMMENT ON FUNCTION download_jobs_episode(download_jobs) IS '@fieldName episodeByEpisodeId';
CREATE FUNCTION download_jobs_episode_id(t download_jobs) RETURNS INTEGER
LANGUAGE sql STABLE AS $$ SELECT te.episode_id FROM task_episodes te WHERE te.task_id=t.id ORDER BY te.position LIMIT 1 $$;
CREATE FUNCTION download_jobs_import_path(t download_jobs) RETURNS TEXT
LANGUAGE sql STABLE AS $$ SELECT te.import_path FROM task_episodes te WHERE te.task_id=t.id ORDER BY te.position LIMIT 1 $$;
CREATE FUNCTION download_jobs_file_path(t download_jobs) RETURNS TEXT
LANGUAGE sql STABLE AS $$ SELECT te.file_path FROM task_episodes te WHERE te.task_id=t.id ORDER BY te.position LIMIT 1 $$;
CREATE FUNCTION download_jobs_nfo_path(t download_jobs) RETURNS TEXT
LANGUAGE sql STABLE AS $$ SELECT te.nfo_path FROM task_episodes te WHERE te.task_id=t.id ORDER BY te.position LIMIT 1 $$;
CREATE FUNCTION download_jobs_jellyfin_episode_id(t download_jobs) RETURNS TEXT
LANGUAGE sql STABLE AS $$ SELECT te.jellyfin_episode_id FROM task_episodes te WHERE te.task_id=t.id ORDER BY te.position LIMIT 1 $$;

COMMIT;
