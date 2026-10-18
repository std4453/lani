BEGIN;

CREATE TYPE "torrent_channel" AS ENUM ('MIKAN', 'NYAA');
ALTER TABLE "torrents"
  ADD COLUMN "display_id" INTEGER,
  ADD COLUMN "channel" "torrent_channel" NOT NULL DEFAULT 'MIKAN',
  ADD COLUMN "permalink" TEXT;

-- 历史展示编号按原主键连续分配；保留原主键及关联关系。
WITH numbered AS (
  SELECT "id", row_number() OVER (ORDER BY "id") AS number FROM "torrents"
)
UPDATE "torrents" SET "display_id" = numbered.number
FROM numbered WHERE "torrents"."id" = numbered."id";

CREATE SEQUENCE "torrents_display_id_seq" OWNED BY "torrents"."display_id";
SELECT setval('"torrents_display_id_seq"', COALESCE(MAX("display_id"), 0) + 1, false)
FROM "torrents";
ALTER TABLE "torrents"
  ALTER COLUMN "display_id" SET NOT NULL,
  ALTER COLUMN "display_id" SET DEFAULT nextval('"torrents_display_id_seq"');
CREATE UNIQUE INDEX "torrents_display_id_key" ON "torrents"("display_id");

COMMIT;
