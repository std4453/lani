ALTER TABLE "seasons"
  ADD COLUMN "declared_episode_count" INTEGER,
  ADD COLUMN "premiere_date" TEXT,
  ADD CONSTRAINT "seasons_declared_episode_count_positive"
    CHECK ("declared_episode_count" IS NULL OR "declared_episode_count" > 0),
  ADD CONSTRAINT "seasons_premiere_date_iso"
    CHECK (
      "premiere_date" IS NULL OR (
        "premiere_date" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        AND to_char("premiere_date"::date, 'YYYY-MM-DD') = "premiere_date"
      )
    );
