-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "current_version_id" INTEGER;

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "size" BIGINT NOT NULL,
    "pool_path" TEXT NOT NULL,
    "pool_identity" JSONB NOT NULL,
    "download_path" TEXT,
    "download_mode" TEXT,
    "download_identity" JSONB,
    "jellyfin_path" TEXT,
    "jellyfin_mode" TEXT,
    "jellyfin_identity" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_versions" (
    "id" SERIAL NOT NULL,
    "episode_id" INTEGER NOT NULL,
    "registration_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "episode_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_version_files" (
    "version_id" INTEGER NOT NULL,
    "asset_id" UUID NOT NULL,
    "target_path" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "episode_version_files_pkey" PRIMARY KEY ("version_id","asset_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_pool_path_key" ON "media_assets"("pool_path");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_jellyfin_path_key" ON "media_assets"("jellyfin_path");

-- CreateIndex
CREATE UNIQUE INDEX "episode_versions_registration_key_key" ON "episode_versions"("registration_key");

-- CreateIndex
CREATE UNIQUE INDEX "episode_versions_id_episode_key" ON "episode_versions"("id", "episode_id");

-- CreateIndex
CREATE UNIQUE INDEX "episode_version_files_version_id_target_path_key" ON "episode_version_files"("version_id", "target_path");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_current_version_id_key" ON "episodes"("current_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_current_version_id_id_key" ON "episodes"("current_version_id", "id");

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_current_version_id_id_fkey" FOREIGN KEY ("current_version_id", "id") REFERENCES "episode_versions"("id", "episode_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "episode_versions" ADD CONSTRAINT "episode_versions_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_version_files" ADD CONSTRAINT "episode_version_files_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_version_files" ADD CONSTRAINT "episode_version_files_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "episode_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 媒体登记只允许通过事务服务修改，避免 PostGraphile 绕过文件系统协议。
COMMENT ON TABLE media_assets IS E'@omit';
COMMENT ON TABLE episode_versions IS E'@omit';
COMMENT ON TABLE episode_version_files IS E'@omit';
COMMENT ON COLUMN episodes.current_version_id IS E'@omit create,update';

ALTER TABLE media_assets ADD CONSTRAINT media_assets_content_check CHECK (
  size > 0 AND pool_path LIKE '/%'
);
ALTER TABLE media_assets ADD CONSTRAINT media_assets_download_check CHECK (
  (download_path IS NULL AND download_mode IS NULL AND download_identity IS NULL) OR
  (download_path IS NOT NULL AND download_mode IS NOT NULL AND download_mode IN ('hardlink', 'copy') AND download_identity IS NOT NULL)
);
ALTER TABLE media_assets ADD CONSTRAINT media_assets_jellyfin_check CHECK (
  (jellyfin_path IS NULL AND jellyfin_mode IS NULL AND jellyfin_identity IS NULL) OR
  (jellyfin_path IS NOT NULL AND jellyfin_mode IS NOT NULL AND jellyfin_mode IN ('hardlink', 'copy') AND jellyfin_identity IS NOT NULL)
);
ALTER TABLE episode_version_files ADD CONSTRAINT episode_version_files_role_check CHECK (role IN ('video', 'subtitle') AND target_path <> '' AND target_path !~ '(^/|^[A-Za-z]:|\\|(^|/)\.\.?(/|$)|//|/$)');
