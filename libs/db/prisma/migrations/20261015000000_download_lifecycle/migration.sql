BEGIN;

CREATE TYPE "task_type" AS ENUM ('DOWNLOAD');

ALTER TABLE "download_jobs"
  ADD COLUMN "type" "task_type" NOT NULL DEFAULT 'DOWNLOAD',
  ADD COLUMN "workflow" JSONB,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

COMMENT ON TABLE "download_jobs" IS E'@name tasks\n@omit delete,create,update';
COMMENT ON COLUMN "download_jobs"."status" IS '@name legacyStage';
COMMENT ON TYPE "download_status" IS '@name legacy_task_stage';

COMMIT;
