-- Run with psql -v ON_ERROR_STOP=1 against an isolated migrated database.
BEGIN;
DO $$
DECLARE t torrents; f integer; s seasons; ordinary integer; special integer;
BEGIN
  t := jsonb_populate_record(NULL::torrents, '{"index":3,"episode_index":9,"subtitle_has_chs":true,"subtitle_has_cht":false,"subtitle_has_jp":false,"subtitle_type":"内挂"}');
  ASSERT torrents_match_number(t) = 3, 'legacy matching must ignore episode_index';
  ASSERT torrents_episode_info(t)->>'index' = '3';
  t.parse_version := 1;
  ASSERT torrents_match_number(t) IS NULL, 'failed new recognition must not revive a legacy number';
  ASSERT torrents_episode_info(t) IS NULL;
  t.episode_type := 'EPISODE'; t.episode_number := 12.5;
  ASSERT torrents_match_number(t) = 12.5;
  ASSERT (torrents_episode_info(t)->>'index')::numeric = 12.5;
  t.episode_type := 'SP';
  ASSERT torrents_match_number(t) IS NULL, 'SP must not match main episodes';
  ASSERT torrents_episode_info(t)->>'type' = 'sp';
  t.episode_number := NULL;
  ASSERT NOT (torrents_episode_info(t) ? 'index'), 'unnumbered SP remains unnumbered';
  t.parse_result := '{"subtitleInfo":null}';
  t.parse_result := '{"subtitleInfo":{"languages":["en"],"multi":true,"delivery":["external"]}}';

  INSERT INTO jellyfin_folders(name,jellyfin_id,location) VALUES ('metadata regression','metadata-regression','/tmp') RETURNING id INTO f;
  INSERT INTO seasons(title,jellyfin_folder_id,tags,aliases) VALUES ('metadata regression',f,'{}','{}') RETURNING * INTO s;
  INSERT INTO episodes(season_id,index,title,air_time) VALUES(s.id,1,'legacy',now()-interval '1 day');
  INSERT INTO episodes(season_id,episode_type,episode_number,title,air_time) VALUES(s.id,'EPISODE',1.5,'fractional',now()-interval '1 day') RETURNING id INTO ordinary;
  INSERT INTO episodes(season_id,episode_type,episode_number,title,air_time,jellyfin_episode_id) VALUES(s.id,'SP',1,'special',now()-interval '1 day','available-special') RETURNING id INTO special;
  ASSERT (SELECT count(*) FROM seasons_main_episodes(s)) = 2;
  ASSERT (SELECT count(*) FROM seasons_main_episodes(s) WHERE jellyfin_episode_id IS NOT NULL) = 0;
  ASSERT (seasons_latest_main_episode(s,now())).id = ordinary;
  ASSERT (SELECT numbering->>'number' FROM (SELECT episodes_numbering(e) numbering FROM episodes e WHERE id=ordinary) x)::numeric = 1.5;
END $$;
ROLLBACK;
