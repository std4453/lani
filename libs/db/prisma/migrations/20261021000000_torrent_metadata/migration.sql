-- 此需求合并为一个新名称的迁移；也能升级本 PR 先前版本的结构。
BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public'
      AND table_name = 'torrents' AND column_name = 'metadata_result') THEN
    ALTER TABLE torrents DROP COLUMN metadata;
    ALTER TABLE torrents RENAME COLUMN metadata_result TO metadata;
  ELSIF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public'
      AND table_name = 'torrents' AND column_name = 'nyaa_metadata_result') THEN
    ALTER TABLE torrents RENAME COLUMN nyaa_metadata_result TO metadata;
    ALTER TABLE torrents RENAME COLUMN nyaa_metadata_status TO metadata_status;
    ALTER TABLE torrents RENAME COLUMN nyaa_metadata_fetched_at TO metadata_fetched_at;
  END IF;
END $$;

ALTER TABLE torrents
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS metadata_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS metadata_error text,
  ADD COLUMN IF NOT EXISTS metadata_fetched_at timestamptz,
  DROP CONSTRAINT IF EXISTS torrents_nyaa_metadata_status_check,
  DROP CONSTRAINT IF EXISTS torrents_metadata_status_check,
  DROP COLUMN IF EXISTS nyaa_metadata,
  DROP COLUMN IF EXISTS nyaa_metadata_failures,
  DROP COLUMN IF EXISTS nyaa_metadata_retry_at;

DROP INDEX IF EXISTS torrents_nyaa_metadata_queue_idx;
DROP INDEX IF EXISTS torrents_metadata_queue_idx;
DROP FUNCTION IF EXISTS torrents_subtitle_info(torrents);
DROP FUNCTION IF EXISTS torrents_title_subtitle_info(torrents);
COMMIT;

-- 唯一的数据转换在结构变更提交后执行，不延长排他锁。
UPDATE torrents SET metadata_status = 'failed', metadata_error = '资源不可用（旧版抓取结果）'
  WHERE metadata_status = 'unavailable';
