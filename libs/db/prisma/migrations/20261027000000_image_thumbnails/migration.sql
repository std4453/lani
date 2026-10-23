ALTER TABLE "images"
  ADD COLUMN "thumbnail_path" TEXT,
  ADD COLUMN "thumbnail_failed_at" TIMESTAMPTZ(6);

COMMENT ON COLUMN "images"."thumbnail_path" IS E'@omit\n由缩略图队列维护的对象路径';
COMMENT ON COLUMN "images"."thumbnail_failed_at" IS E'@omit\n缩略图已用尽重试次数的时间，清空后允许重新生成';
