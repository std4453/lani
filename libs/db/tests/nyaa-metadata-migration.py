"""在临时 PostgreSQL 验证单迁移的首次安装、旧 PR 结构升级和锁范围。"""
from pathlib import Path
import subprocess
import os
import time
from urllib.parse import quote
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'
TARGET = '20261021000000_torrent_metadata'


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
        for variant in ['fresh', 'nyaa', 'generic']:
            run('createdb', '-h', directory, '-U', 'lani_test', variant)

            def sql(statement):
                # 整段发送，模拟 Prisma 的迁移协议与隐式事务行为。
                return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', variant,
                           '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

            for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
                if migration.parent.name != TARGET:
                    sql(migration.read_text())
            sql("""INSERT INTO torrents (title, torrent_link, size, publish_date, hash, channel)
                SELECT 'title', 'link', 1, now(), i::text, 'NYAA' FROM generate_series(1, 3) i;""")
            if variant != 'fresh':
                prefix = 'nyaa_' if variant == 'nyaa' else ''
                # 重现旧结构：原始响应与最终解析各占一列。
                sql(f"""ALTER TABLE torrents
                    ADD COLUMN {prefix}metadata jsonb,
                    ADD COLUMN {prefix}metadata_result jsonb,
                    ADD COLUMN {prefix}metadata_status text NOT NULL DEFAULT 'pending',
                    ADD COLUMN {prefix}metadata_fetched_at timestamptz;
                    UPDATE torrents SET {prefix}metadata = '{{"description":"raw response"}}',
                      {prefix}metadata_result = '{{"version":1,"status":"known","subtitleInfo":{{"languages":["en"],"multi":false,"delivery":[]}}}}',
                      {prefix}metadata_status = 'failed',
                      {prefix}metadata_fetched_at = '2026-10-19T00:00:00Z' WHERE hash = '1';
                    UPDATE torrents SET {prefix}metadata_status = 'unavailable' WHERE hash = '2';
                """)
                if variant == 'nyaa':
                    sql("""ALTER TABLE torrents ADD COLUMN nyaa_metadata_failures integer DEFAULT 0,
                        ADD COLUMN nyaa_metadata_retry_at timestamptz;
                        ALTER FUNCTION torrents_subtitle_info(torrents) RENAME TO torrents_title_subtitle_info;
                        CREATE FUNCTION torrents_subtitle_info(torrents) RETURNS jsonb LANGUAGE sql STABLE AS 'SELECT NULL::jsonb';
                    """)
                else:
                    sql("ALTER TABLE torrents ADD COLUMN metadata_error text;")

            migration = (MIGRATIONS / TARGET / 'migration.sql').read_text()
            sql(migration)
            assert sql("SELECT count(*) FROM information_schema.columns WHERE table_name='torrents' AND (column_name LIKE 'nyaa_metadata%' OR column_name='metadata_result')") == '0'
            assert sql("SELECT count(*) FROM pg_proc WHERE proname IN ('torrents_subtitle_info','torrents_title_subtitle_info')") == '0'
            assert sql("SELECT count(*) FROM torrents WHERE title='title'") == '3'
            if variant == 'fresh':
                assert sql("SELECT count(*) FROM torrents WHERE metadata_status='pending' AND metadata IS NULL") == '3'
            else:
                assert sql("SELECT metadata->>'status' FROM torrents WHERE hash='1'") == 'known'
                assert sql("SELECT metadata ? 'description' FROM torrents WHERE hash='1'") == 'f'
                assert sql("SELECT metadata_fetched_at = '2026-10-19T00:00:00Z' FROM torrents WHERE hash='1'") == 't'
                assert sql("SELECT metadata_status FROM torrents WHERE hash='2'") == 'failed'
            sql(migration)
            if variant == 'generic':
                sql("""UPDATE torrents SET metadata_status='unavailable' WHERE hash='2';
                    CREATE FUNCTION slow_status_update() RETURNS trigger LANGUAGE plpgsql AS $$
                    BEGIN PERFORM pg_advisory_xact_lock(780078); PERFORM pg_sleep(2); RETURN NEW; END $$;
                    CREATE TRIGGER slow_status_update BEFORE UPDATE ON torrents FOR EACH ROW
                    WHEN (OLD.metadata_status = 'unavailable') EXECUTE FUNCTION slow_status_update();""")
                process = subprocess.Popen(['psql', '-X', '-h', directory, '-U', 'lani_test', '-d', variant,
                    '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', migration], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                try:
                    for _ in range(50):
                        if sql("SELECT count(*) FROM pg_locks WHERE locktype='advisory' AND objid=780078") == '1':
                            break
                        time.sleep(0.05)
                    else:
                        raise AssertionError('migration did not reach the delayed data update')
                    # 数据转换仍在进行时，其他记录可以读写：结构变更的排他锁已释放。
                    sql("SET lock_timeout='300ms'; SELECT id FROM torrents WHERE hash='1'; UPDATE torrents SET metadata_error='probe' WHERE hash='3';")
                    _, error = process.communicate(timeout=10)
                    assert process.returncode == 0, error
                finally:
                    if process.poll() is None:
                        process.terminate()
                        process.communicate(timeout=10)
            if variant == 'fresh':
                sql("""UPDATE torrents SET parse_version=1,
                    parse_result='{"subtitleInfo":{"languages":["zh"],"multi":false,"delivery":[]}}',
                    metadata='{"status":"known","subtitleInfo":{"languages":["en","zh-Hant"],"multi":true,"delivery":["muxed"]}}',
                    metadata_status='failed' WHERE hash='1';
                    UPDATE torrents SET subtitle_has_chs=true, subtitle_type='内挂' WHERE hash='2';
                    UPDATE torrents SET parse_version=1, parse_result='{"subtitleInfo":null}' WHERE hash='3';""")
                url = f'postgresql://lani_test@localhost/{variant}?host={quote(directory, safe="")}'
                print(run('node', str(Path(__file__).with_name('torrent-subtitle-federation.cjs')),
                    env={**os.environ, 'LANI_METADATA_TEST_DATABASE_URL': url}))
            print(f'Torrent metadata migration ({variant}) passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
