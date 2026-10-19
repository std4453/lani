BEGIN;

ALTER TABLE torrents
  ADD COLUMN metadata jsonb,
  ADD COLUMN metadata_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN metadata_error text,
  ADD COLUMN metadata_fetched_at timestamptz;

-- 字幕信息由 API resolver 合并，不再通过数据库计算字段提供。
DROP FUNCTION torrents_subtitle_info(torrents);

COMMIT;
