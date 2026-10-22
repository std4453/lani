BEGIN;

CREATE TABLE torrent_match_catalog (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  state jsonb NOT NULL DEFAULT '{}'
);
COMMENT ON TABLE torrent_match_catalog IS E'@omit';

CREATE TYPE torrent_match_status AS ENUM ('PENDING', 'MATCHED', 'NO_MATCH', 'UNSUPPORTED', 'DISMISSED');
ALTER TABLE torrents
  ADD COLUMN matched_season_id integer REFERENCES seasons(id) ON DELETE SET NULL,
  ADD COLUMN match_details jsonb,
  ADD COLUMN matched_at timestamptz,
  ADD COLUMN match_status torrent_match_status;
CREATE INDEX torrents_matched_season_id_idx ON torrents(matched_season_id);
CREATE INDEX torrents_match_status_idx ON torrents(match_status);
COMMENT ON COLUMN torrents.matched_season_id IS E'@omit create,update';
COMMENT ON COLUMN torrents.match_details IS E'@omit create,update';
COMMENT ON COLUMN torrents.matched_at IS E'@omit create,update';
COMMENT ON COLUMN torrents.match_status IS E'@omit create,update';
-- 种子写入和入队统一由 API 的业务事务负责，不自动回填历史种子。
COMMENT ON TABLE torrents IS E'@omit create,update';

COMMIT;
