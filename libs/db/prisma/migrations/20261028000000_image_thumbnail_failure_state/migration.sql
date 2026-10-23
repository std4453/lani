ALTER TABLE "images" ADD COLUMN "thumbnail_failed_at" TIMESTAMPTZ(6);

-- 旧记录没有失败时间，用迁移时间保留其终止状态，避免重新入队。
UPDATE "images"
SET "thumbnail_failed_at" = CURRENT_TIMESTAMP
WHERE "thumbnail_failed_path" IS NOT NULL;

ALTER TABLE "images" DROP COLUMN "thumbnail_failed_path";
COMMENT ON COLUMN "images"."thumbnail_failed_at" IS E'@omit\n缩略图已用尽重试次数的时间，清空后允许重新生成';
