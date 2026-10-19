BEGIN;

ALTER TABLE torrents
  ADD COLUMN nyaa_metadata jsonb,
  ADD COLUMN nyaa_metadata_result jsonb,
  ADD COLUMN nyaa_metadata_fetched_at timestamptz,
  ADD COLUMN nyaa_metadata_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN nyaa_metadata_failures integer NOT NULL DEFAULT 0,
  ADD COLUMN nyaa_metadata_retry_at timestamptz;

ALTER TABLE torrents ADD CONSTRAINT torrents_nyaa_metadata_status_check
  CHECK (nyaa_metadata_status IN ('pending', 'parsed', 'failed', 'unavailable'));
CREATE INDEX torrents_nyaa_metadata_queue_idx ON torrents (publish_date DESC, id)
  WHERE channel = 'NYAA' AND nyaa_metadata_fetched_at IS NULL
    AND nyaa_metadata_status IN ('pending', 'failed');

-- 标题解析和页面分析分别存储，重解析标题不会抹去页面证据。
ALTER FUNCTION torrents_subtitle_info(torrents) RENAME TO torrents_title_subtitle_info;
COMMENT ON FUNCTION torrents_title_subtitle_info(torrents) IS E'@omit';
CREATE FUNCTION torrents_subtitle_info(t torrents) RETURNS jsonb
LANGUAGE sql STABLE AS $$
  WITH info AS (
    SELECT torrents_title_subtitle_info(t) AS title,
      CASE WHEN t.nyaa_metadata_status = 'parsed'
        THEN t.nyaa_metadata_result->'subtitleInfo' END AS page
  ), merged AS (
    SELECT title, page,
      ARRAY(SELECT DISTINCT value FROM jsonb_array_elements_text(
        coalesce(title->'languages', '[]'::jsonb) || coalesce(page->'languages', '[]'::jsonb)
      ) ORDER BY value) AS languages,
      ARRAY(SELECT DISTINCT value FROM jsonb_array_elements_text(
        coalesce(title->'delivery', '[]'::jsonb) || coalesce(page->'delivery', '[]'::jsonb)
      ) ORDER BY value) AS delivery
    FROM info
  ), normalized AS (
    SELECT *, ARRAY(SELECT language FROM unnest(languages) language
      WHERE language <> 'zh' OR NOT (languages && ARRAY['zh-Hans', 'zh-Hant'])) AS effective_languages
    FROM merged
  )
  SELECT CASE
    WHEN page IS NULL THEN title
    -- 页面明确无字幕，但标题有具体语言时保留标题证据。
    WHEN page = 'null'::jsonb THEN
      CASE WHEN coalesce(jsonb_array_length(title->'languages'), 0) > 0 THEN title ELSE page END
    ELSE jsonb_build_object('languages', to_jsonb(effective_languages),
      'multi', coalesce((title->>'multi')::boolean, false)
        OR coalesce((page->>'multi')::boolean, false) OR cardinality(effective_languages) > 1,
      'delivery', to_jsonb(delivery))
    END
  FROM normalized
$$;

COMMIT;
