BEGIN;

-- 旧季度按需同步，不在迁移中移动目录或重写元数据。
ALTER TABLE seasons
  ADD COLUMN directory text,
  ADD COLUMN last_write_directory text;
CREATE UNIQUE INDEX seasons_jellyfin_folder_id_directory_key
  ON seasons(jellyfin_folder_id, directory);

-- 路径由 API 写盘流程维护，保留查询能力。
COMMENT ON COLUMN seasons.directory IS E'@omit create,update\n季度标题清洗后的目录名';
COMMENT ON COLUMN seasons.last_write_directory IS E'@omit create,update\n上次实际落盘的目录名';

COMMIT;
