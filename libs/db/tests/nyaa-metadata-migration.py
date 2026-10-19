"""使用临时 Unix socket PostgreSQL 验证已部署结构升级及真实 GraphQL 字幕查询。"""
from pathlib import Path
import os
import subprocess
import tempfile
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[3]
MIGRATIONS = ROOT / 'libs/db/prisma/migrations'


def run(*args, **kwargs):
    result = subprocess.run(args, text=True, capture_output=True, **kwargs)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-nyaa-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        def sql(statement):
            # 每份迁移整体发送，覆盖并发索引在批量 SQL 隐式事务中的限制。
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'postgres',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            sql(migration.read_text())
            if migration.parent.name == '20261019000000_nyaa_metadata':
                sql("""
                    INSERT INTO torrents (title, torrent_link, size, publish_date, hash, channel)
                    SELECT 'title', 'link', 1, now(), i::text, 'NYAA' FROM generate_series(1, 7) i;
                    UPDATE torrents SET channel = 'MIKAN', subtitle_has_chs = true WHERE hash = '2';
                    UPDATE torrents SET publish_date = now() - interval '31 days' WHERE hash = '3';
                    UPDATE torrents SET nyaa_metadata_retry_at = now() + interval '5 minutes' WHERE hash = '4';
                    UPDATE torrents SET nyaa_metadata_status = 'failed', nyaa_metadata_failures = 3 WHERE hash = '5';
                    UPDATE torrents SET nyaa_metadata_status = 'unavailable' WHERE hash = '6';
                    UPDATE torrents SET nyaa_metadata_status = 'parsed', nyaa_metadata_fetched_at = now(),
                      nyaa_metadata_result = '{"version":1,"status":"unknown"}' WHERE hash = '7';
                    UPDATE torrents SET parse_version = 2,
                      parse_result = '{"subtitleInfo":{"languages":["zh"],"multi":false,"delivery":[]}}',
                      nyaa_metadata = '{"description":"Subs: English, Traditional Chinese"}',
                      nyaa_metadata_fetched_at = '2026-10-19T00:00:00Z',
                      nyaa_metadata_status = 'failed',
                      nyaa_metadata_result = '{"version":1,"status":"known","subtitleInfo":{"languages":["en","zh-Hant"],"multi":true,"delivery":["muxed"]}}'
                      WHERE hash = '1';
                """)

        assert sql("""SELECT string_agg(hash, ',' ORDER BY hash) FROM torrents
            WHERE channel = 'NYAA' AND publish_date >= now() - interval '30 days'
              AND publish_date <= now() AND metadata_status IN ('pending', 'failed')""") == '1,4,5,6'
        assert sql("SELECT metadata_status FROM torrents WHERE hash='6'") == 'failed'
        assert sql("SELECT metadata_error IS NOT NULL FROM torrents WHERE hash='6'") == 't'
        assert sql("SELECT metadata->>'description' FROM torrents WHERE hash='1'") == 'Subs: English, Traditional Chinese'
        assert sql("SELECT metadata_fetched_at = '2026-10-19T00:00:00Z' FROM torrents WHERE hash='1'") == 't'
        assert sql("SELECT metadata_result->>'status' FROM torrents WHERE hash='1'") == 'known'
        assert sql("SELECT count(*) FROM information_schema.columns WHERE table_name='torrents' AND column_name LIKE 'nyaa_metadata%'") == '0'
        assert sql("SELECT convalidated FROM pg_constraint WHERE conname='torrents_metadata_status_check'") == 't'
        assert sql("SELECT indisvalid FROM pg_index WHERE indexrelid='torrents_metadata_queue_idx'::regclass") == 't'
        try:
            sql("UPDATE torrents SET metadata_status='invalid' WHERE hash='1'")
            raise AssertionError('metadata status constraint did not reject invalid value')
        except RuntimeError as error:
            assert 'torrents_metadata_status_check' in str(error)
        # SQL 只保留迁移前的标题兼容字段；合并由 Data Server 完成。
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='1'") == '["zh"]'
        assert sql("SELECT torrents_subtitle_info(t)->'languages' FROM torrents t WHERE hash='2'") == '["zh-Hans"]'
        assert sql("SELECT count(*) FROM torrents WHERE title='title'") == '7'
        print('Generic metadata upgrade, preserved results, constraints and concurrent index checks passed')
        url = f'postgresql://lani_test@localhost/postgres?host={quote(directory, safe="")}'
        print(run('node', str(ROOT / 'apps/data-server/tests/subtitle-info.integration.cjs'),
                  env={**os.environ, 'LANI_METADATA_TEST_DATABASE_URL': url}))
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
