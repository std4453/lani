-- 前一版迁移已执行，保留历史；此处仅修改结构，不扫描记录。
BEGIN;
ALTER TABLE torrents
  RENAME COLUMN nyaa_metadata TO metadata;
ALTER TABLE torrents RENAME COLUMN nyaa_metadata_result TO metadata_result;
ALTER TABLE torrents RENAME COLUMN nyaa_metadata_fetched_at TO metadata_fetched_at;
ALTER TABLE torrents RENAME COLUMN nyaa_metadata_status TO metadata_status;
ALTER TABLE torrents
  DROP CONSTRAINT torrents_nyaa_metadata_status_check,
  DROP COLUMN nyaa_metadata_failures,
  DROP COLUMN nyaa_metadata_retry_at,
  ADD COLUMN metadata_error text;

-- 恢复原有标题字段；页面与标题的合并由 Data Server 完成。
DROP FUNCTION torrents_subtitle_info(torrents);
ALTER FUNCTION torrents_title_subtitle_info(torrents) RENAME TO torrents_subtitle_info;
COMMENT ON FUNCTION torrents_subtitle_info(torrents) IS NULL;
DROP INDEX torrents_nyaa_metadata_queue_idx;
COMMIT;

-- 数据转换与验证不占用上述结构变更的排他锁。
BEGIN;
UPDATE torrents SET metadata_status = 'failed', metadata_error = '资源不可用（旧版抓取结果）'
  WHERE metadata_status = 'unavailable';
COMMIT;

BEGIN;
ALTER TABLE torrents ADD CONSTRAINT torrents_metadata_status_check
  CHECK (metadata_status IN ('pending', 'parsed', 'failed')) NOT VALID;
COMMIT;
ALTER TABLE torrents VALIDATE CONSTRAINT torrents_metadata_status_check;
