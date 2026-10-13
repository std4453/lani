BEGIN;

CREATE TYPE episode_type AS ENUM ('EPISODE', 'SP', 'OVA', 'OAD');
ALTER TABLE episodes
  ALTER COLUMN index DROP NOT NULL,
  ADD COLUMN episode_type episode_type NOT NULL DEFAULT 'EPISODE',
  ADD COLUMN episode_number numeric(10,3),
  ADD COLUMN bangumi_episode_id integer,
  ADD COLUMN bangumi_sort numeric(10,3),
  ADD COLUMN source_data jsonb,
  ADD CONSTRAINT episodes_season_id_episode_type_episode_number_key
    UNIQUE (season_id, episode_type, episode_number),
  ADD CONSTRAINT episodes_season_id_bangumi_episode_id_key
    UNIQUE (season_id, bangumi_episode_id),
  ADD CONSTRAINT episodes_number_check CHECK
    (episode_number IS NULL OR (episode_number >= 0 AND episode_number <> 'NaN'::numeric));

ALTER TABLE torrents
  ADD COLUMN parse_result jsonb,
  ADD COLUMN parse_version integer,
  ADD COLUMN parsed_at timestamptz,
  ADD COLUMN episode_type episode_type,
  ADD COLUMN episode_number numeric(10,3),
  ADD COLUMN episode_number_from numeric(10,3),
  ADD COLUMN episode_number_to numeric(10,3),
  ADD CONSTRAINT torrents_episode_number_check CHECK (
    (episode_number IS NULL OR (episode_number >= 0 AND episode_number <> 'NaN'::numeric))
    AND (episode_number IS NULL OR (episode_number_from IS NULL AND episode_number_to IS NULL))
    AND ((episode_number_from IS NULL AND episode_number_to IS NULL)
      OR (episode_number IS NULL AND episode_number_from IS NOT NULL AND episode_number_to IS NOT NULL
        AND episode_number_from >= 0 AND episode_number_to >= episode_number_from
        AND episode_number_to <> 'NaN'::numeric))
  );

-- Compatibility is evaluated on read. No title parsing or row backfill runs here.
CREATE FUNCTION torrents_match_number(t torrents) RETURNS numeric
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE WHEN t.parse_version IS NULL THEN t.index::numeric
    WHEN t.episode_type = 'EPISODE' THEN t.episode_number END
$$;
COMMENT ON FUNCTION torrents_match_number(torrents) IS E'@omit';
CREATE INDEX torrents_match_number_idx ON torrents (torrents_match_number(torrents));
CREATE INDEX download_jobs_episode_id_idx ON download_jobs (episode_id);

-- PostGraphile computes these JSON fields in the list query (no per-row fetch).
CREATE FUNCTION torrents_episode_info(t torrents) RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN t.parse_version IS NULL THEN
    CASE WHEN t.index IS NOT NULL THEN jsonb_build_object('type', 'episode', 'index', t.index::text)
      WHEN t.index_from IS NOT NULL AND t.index_to IS NOT NULL THEN
        jsonb_build_object('type', 'episode', 'index', jsonb_build_object('from', t.index_from::text, 'to', t.index_to::text)) END
    WHEN t.episode_type IS NOT NULL THEN jsonb_strip_nulls(jsonb_build_object(
      'type', lower(t.episode_type::text), 'index', CASE
        WHEN t.episode_number IS NOT NULL THEN to_jsonb(t.episode_number::text)
        WHEN t.episode_number_from IS NOT NULL THEN jsonb_build_object('from', t.episode_number_from::text, 'to', t.episode_number_to::text) END)) END
$$;
CREATE FUNCTION torrents_subtitle_info(t torrents) RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN t.parse_version IS NOT NULL THEN t.parse_result->'subtitleInfo'
    WHEN t.subtitle_has_chs OR t.subtitle_has_cht OR t.subtitle_has_jp OR t.subtitle_type IS NOT NULL THEN
      jsonb_build_object('languages', to_jsonb(array_remove(ARRAY[
        CASE WHEN t.subtitle_has_chs THEN 'zh-Hans' END,
        CASE WHEN t.subtitle_has_cht THEN 'zh-Hant' END,
        CASE WHEN t.subtitle_has_jp THEN 'ja' END], NULL)),
      'multi', (t.subtitle_has_chs::int + t.subtitle_has_cht::int + t.subtitle_has_jp::int) > 1,
      'delivery', to_jsonb(array_remove(ARRAY[CASE t.subtitle_type
        WHEN '内嵌' THEN 'burned-in' WHEN '内挂' THEN 'muxed' WHEN '内封' THEN 'muxed' WHEN '外挂' THEN 'external' END], NULL))) END
$$;
CREATE FUNCTION episodes_numbering(e episodes) RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('type', lower(e.episode_type::text),
    'number', coalesce(e.episode_number, e.index)::text, 'sort', e.bangumi_sort::text)
$$;
CREATE FUNCTION seasons_main_episodes(s seasons) RETURNS SETOF episodes
LANGUAGE sql STABLE AS $$
  SELECT e.* FROM episodes e WHERE e.season_id = s.id AND e.episode_type = 'EPISODE'
  ORDER BY coalesce(e.bangumi_sort, e.episode_number, e.index), e.id
$$;
CREATE FUNCTION seasons_latest_main_episode(s seasons, at_time timestamptz) RETURNS episodes
LANGUAGE sql STABLE AS $$
  SELECT e FROM episodes e WHERE e.season_id = s.id AND e.episode_type = 'EPISODE' AND e.air_time <= at_time
  ORDER BY coalesce(e.bangumi_sort, e.episode_number, e.index) DESC NULLS LAST, e.id DESC LIMIT 1
$$;

CREATE FUNCTION torrents_episode_sort(t torrents) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN t.parse_version IS NULL THEN coalesce(t.index, t.index_from)::numeric
    ELSE coalesce(t.episode_number, t.episode_number_from) END
$$;
COMMENT ON FUNCTION torrents_episode_sort(torrents) IS E'@sortable';

COMMIT;
