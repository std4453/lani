ALTER TABLE "images"
  ADD COLUMN "thumbnail_path" TEXT,
  ADD COLUMN "thumbnail_failed_path" TEXT;

COMMENT ON COLUMN "images"."thumbnail_path" IS E'@omit\n由缩略图队列维护的对象路径';
COMMENT ON COLUMN "images"."thumbnail_failed_path" IS E'@omit\n已用尽重试次数的缩略图对象路径';
