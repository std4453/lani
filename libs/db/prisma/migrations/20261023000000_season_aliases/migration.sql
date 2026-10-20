-- 历史季度保留空数组，后续正常同步元数据时填充名称。
ALTER TABLE seasons ADD COLUMN aliases TEXT[] NOT NULL DEFAULT '{}';
