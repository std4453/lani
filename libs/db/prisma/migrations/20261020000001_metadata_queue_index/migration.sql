-- 独立迁移只含一条语句，避免 Prisma 批量发送 SQL 时形成隐式事务。
CREATE INDEX CONCURRENTLY torrents_metadata_queue_idx ON torrents (channel, publish_date DESC, id)
  WHERE metadata_status IN ('pending', 'failed');
