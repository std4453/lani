BEGIN;

-- Existing globally unique patterns also satisfy this weaker constraint.
-- Create the replacement before removing the old index; preserve every row.
CREATE UNIQUE INDEX "download_sources_season_id_pattern_key"
    ON "download_sources"("season_id", "pattern");

-- Some existing databases use a UNIQUE constraint instead of a standalone
-- index. Dropping that constraint also removes its backing index.
ALTER TABLE "download_sources"
    DROP CONSTRAINT IF EXISTS "download_sources_pattern_key";
DROP INDEX IF EXISTS "download_sources_pattern_key";

-- PostGraphile must use the same uniqueness scope as Prisma.
COMMENT ON TABLE "download_sources" IS E'@omit delete,create,update\n@unique season_id,pattern';

COMMIT;
