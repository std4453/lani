"""使用临时 Unix socket PostgreSQL 验证迁移、字幕合并及队列恢复条件。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'


def run(*args, **kwargs):
    result = subprocess.run(args, text=True, capture_output=True, **kwargs)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-nyaa-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'postgres',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', input=statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            sql(migration.read_text())
        sql("""
            INSERT INTO torrents (title, torrent_link, size, publish_date, hash, channel)
            SELECT 'title', 'link', 1, now(), i::text, 'NYAA' FROM generate_series(1, 7) i;
            UPDATE torrents SET channel = 'MIKAN' WHERE hash = '2';
            UPDATE torrents SET publish_date = now() - interval '31 days' WHERE hash = '3';
            UPDATE torrents SET nyaa_metadata_retry_at = now() + interval '5 minutes' WHERE hash = '4';
            UPDATE torrents SET nyaa_metadata_status = 'failed',
              nyaa_metadata_retry_at = now() - interval '1 minute' WHERE hash = '5';
            UPDATE torrents SET nyaa_metadata_status = 'unavailable' WHERE hash = '6';
            UPDATE torrents SET nyaa_metadata_status = 'parsed',
              nyaa_metadata_fetched_at = now(), nyaa_metadata_result = '{"version":1,"status":"unknown"}'
              WHERE hash = '7';
        """)
        assert sql("""SELECT string_agg(hash, ',' ORDER BY hash) FROM torrents
            WHERE channel = 'NYAA' AND publish_date >= now() - interval '30 days'
              AND publish_date <= now() AND nyaa_metadata_fetched_at IS NULL
              AND nyaa_metadata_status IN ('pending', 'failed')
              AND (nyaa_metadata_retry_at IS NULL OR nyaa_metadata_retry_at <= now())""") == '1,5'
        sql("""UPDATE torrents SET parse_version = 2,
            parse_result = '{"subtitleInfo":{"languages":[],"multi":true,"delivery":[]}}'
            WHERE hash = '1'""")
        assert sql("SELECT torrents_subtitle_info(t)->>'multi' FROM torrents t WHERE hash='1'") == 'true'
        sql("""UPDATE torrents SET nyaa_metadata_status='parsed',
            nyaa_metadata_result='{"status":"known","subtitleInfo":{"languages":["en","zh-Hant"],"multi":true,"delivery":["muxed"]}}'
            WHERE hash='1'""")
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='1'") == '["en", "zh-Hant"]'
        sql("""UPDATE torrents SET parse_result='{"subtitleInfo":{"languages":["zh"],"multi":false,"delivery":[]}}' WHERE hash='1'""")
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='1'") == '["en", "zh-Hant"]'
        # 重解析标题仍保留页面结果，标题的交付方式和语言参与合并、去重。
        sql("""UPDATE torrents SET parse_result='{"subtitleInfo":{"languages":["en","ja"],"multi":true,"delivery":["muxed"]}}' WHERE hash='1'""")
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='1'") == '["en", "ja", "zh-Hant"]'
        assert sql("SELECT torrents_subtitle_info(t)->'delivery' FROM torrents t WHERE hash='1'") == '["muxed"]'
        # 页面未识别不覆盖已有标题；页面与标题明确无字幕则保留 JSON null。
        sql("""UPDATE torrents SET nyaa_metadata_result='{"status":"unknown"}' WHERE hash='1'""")
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='1'") == '["en", "ja"]'
        sql("""UPDATE torrents SET nyaa_metadata_result='{"status":"none","subtitleInfo":null}' WHERE hash='1'""")
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='1'") == '["en", "ja"]'
        sql("""UPDATE torrents SET parse_result='{"subtitleInfo":null}' WHERE hash='1'""")
        assert sql("SELECT torrents_subtitle_info(t) FROM torrents t WHERE hash='1'") == 'null'
        # 旧蜜柑字段仍可读；迁移未改写标题、编号或旧解析数据。
        sql("UPDATE torrents SET subtitle_has_chs=true WHERE hash='2'")
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='2'") == '["zh-Hans"]'
        assert sql("SELECT count(*) FROM torrents WHERE title='title'") == '7'
        print('Nyaa metadata migration and subtitle merge checks passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
