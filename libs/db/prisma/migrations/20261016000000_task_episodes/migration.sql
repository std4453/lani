BEGIN;

ALTER TYPE task_type ADD VALUE 'IMPORT';
ALTER TYPE task_type ADD VALUE 'BATCH_IMPORT';
ALTER TABLE download_jobs ADD COLUMN source_path TEXT, ADD COLUMN batch_entries JSONB;
CREATE TABLE task_episodes (
  task_id INTEGER NOT NULL REFERENCES download_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(task_id, episode_id)
);
CREATE INDEX task_episodes_episode_id_idx ON task_episodes(episode_id);
COMMENT ON TABLE task_episodes IS E'@omit create,update,delete';
INSERT INTO task_episodes(task_id, episode_id)
SELECT id, episode_id FROM download_jobs WHERE episode_id IS NOT NULL;

-- 单集目标与产物仍属于任务；反向查询包含下载和所有导入任务。
COMMENT ON CONSTRAINT download_jobs_episode_id_fkey ON download_jobs IS '@foreignFieldName singleTasksByEpisodeId';
CREATE FUNCTION episodes_tasks(e episodes) RETURNS SETOF download_jobs
LANGUAGE sql STABLE AS $$
  SELECT t.* FROM download_jobs t WHERE EXISTS (
    SELECT 1 FROM task_episodes te WHERE te.task_id=t.id AND te.episode_id=e.id
  )
$$;
COMMENT ON FUNCTION episodes_tasks(episodes) IS E'@fieldName tasksByEpisodeId\n@sortable\n@filterable';

COMMIT;
