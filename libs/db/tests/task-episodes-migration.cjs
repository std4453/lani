// 仅在隔离数据库内创建事务级测试 schema，验证真实迁移 SQL。
const { execFileSync } = require("child_process");
const { readFileSync } = require("fs");
const path = require("path");
const url = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
if (
  !url ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  !new URL(url).pathname.endsWith("_test")
) {
  throw new Error(
    "Set LANI_LIFECYCLE_TEST_DATABASE_URL to an isolated localhost *_test database"
  );
}
const migration = readFileSync(
  path.join(
    __dirname,
    "../prisma/migrations/20261016000000_task_episodes/migration.sql"
  ),
  "utf8"
);
const sql = `
BEGIN;
CREATE SCHEMA task_episode_migration_test;
SET LOCAL search_path TO task_episode_migration_test;
CREATE TYPE task_type AS ENUM ('DOWNLOAD');
CREATE TABLE episodes(id INTEGER PRIMARY KEY);
CREATE TABLE download_jobs(id INTEGER PRIMARY KEY, episode_id INTEGER REFERENCES episodes(id), import_path TEXT, file_path TEXT, nfo_path TEXT, jellyfin_episode_id TEXT, workflow JSONB);
INSERT INTO episodes VALUES (1);
INSERT INTO download_jobs VALUES (1, 1, '/input.mkv', '/output.mkv', '/episode.nfo', 'jf-1', '{"steps":[{"checkpoint":{"episodePublished":true}}]}'), (2, NULL, NULL, '/historical.mkv', NULL, NULL, NULL);
${migration.replace(/^BEGIN;|COMMIT;$/gm, "")}
DO $$ BEGIN
  IF (SELECT count(*) FROM task_episodes) <> 2 THEN RAISE EXCEPTION 'Missing migrated rows'; END IF;
  IF NOT EXISTS (SELECT 1 FROM task_episodes WHERE task_id=1 AND position=0 AND episode_id=1 AND import_path='/input.mkv' AND file_path='/output.mkv' AND nfo_path='/episode.nfo' AND jellyfin_episode_id='jf-1') THEN RAISE EXCEPTION 'Lost artifacts'; END IF;
  IF NOT EXISTS (SELECT 1 FROM download_jobs WHERE id=1 AND workflow->'steps' @> '[{"checkpoint":{"episodePublished":true}}]'::jsonb) THEN RAISE EXCEPTION 'Lost checkpoint'; END IF;
  IF (SELECT download_jobs_file_path(t) FROM download_jobs t WHERE id=2) <> '/historical.mkv' THEN RAISE EXCEPTION 'Lost historical projection'; END IF;
  IF (SELECT count(*) FROM episodes_tasks((SELECT e FROM episodes e WHERE id=1))) <> 1 THEN RAISE EXCEPTION 'Missing reverse projection'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='task_episode_migration_test' AND table_name='download_jobs' AND column_name IN ('episode_id','file_path','import_path','nfo_path','jellyfin_episode_id')) THEN RAISE EXCEPTION 'Duplicate authoritative fields'; END IF;
END $$;
DELETE FROM episodes WHERE id=1;
DO $$ BEGIN
  IF (SELECT count(*) FROM download_jobs) <> 2 OR EXISTS (SELECT 1 FROM task_episodes WHERE episode_id IS NOT NULL) THEN RAISE EXCEPTION 'Deleting episode lost history'; END IF;
END $$;
ROLLBACK;
`;
execFileSync("psql", [url, "-X", "-v", "ON_ERROR_STOP=1", "-q"], {
  input: sql,
  stdio: ["pipe", "inherit", "inherit"],
});
console.log("Task episode migration regression passed.");
