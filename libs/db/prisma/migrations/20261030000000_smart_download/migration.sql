-- AlterTable
ALTER TABLE "seasons" ADD COLUMN     "smart_download_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smart_download_prefer_baha" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smart_download_subtitle" TEXT NOT NULL DEFAULT E'chinese',
ADD COLUMN     "smart_download_timeout_minutes" INTEGER DEFAULT 120,
ADD COLUMN     "smart_download_window_hours" INTEGER NOT NULL DEFAULT 48;

-- AlterTable
ALTER TABLE "download_jobs" ADD COLUMN     "download_timeout_minutes" INTEGER,
ADD COLUMN     "is_smart_download" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smart_download_decision" JSONB,
ADD COLUMN     "smart_download_torrent_hash" TEXT;

-- CreateIndex
CREATE INDEX "torrents_matched_season_id_publish_date_id_idx" ON "torrents"("matched_season_id", "publish_date", "id");

ALTER TABLE "seasons"
  ADD CONSTRAINT "smart_download_subtitle_valid" CHECK ("smart_download_subtitle" IN ('chinese', 'chinese-or-english', 'any')),
  ADD CONSTRAINT "smart_download_window_valid" CHECK ("smart_download_window_hours" BETWEEN 1 AND 168),
  ADD CONSTRAINT "smart_download_timeout_valid" CHECK ("smart_download_timeout_minutes" IS NULL OR "smart_download_timeout_minutes" >= 0);
ALTER TABLE "download_jobs"
  ADD CONSTRAINT "download_timeout_valid" CHECK ("download_timeout_minutes" IS NULL OR "download_timeout_minutes" >= 0);
