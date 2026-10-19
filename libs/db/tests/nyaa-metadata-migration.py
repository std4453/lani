"""在临时 PostgreSQL 验证从 next 首次升级及字幕 Federation 查询。"""
from pathlib import Path
import subprocess
import os
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
        run('createdb', '-h', directory, '-U', 'lani_test', 'metadata_test')

        def sql(statement):
            # 整段发送，模拟 Prisma 的迁移协议与隐式事务行为。
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'metadata_test',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name < TARGET:
                sql(migration.read_text())
        sql("""INSERT INTO torrents (title, torrent_link, size, publish_date, hash, channel)
            SELECT 'title', 'link', 1, now(), i::text, 'NYAA' FROM generate_series(1, 3) i;""")
        before = sql("SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM torrents t")
        assert sql("SELECT count(*) FROM pg_proc WHERE proname='torrents_subtitle_info'") == '1'
        sql((MIGRATIONS / TARGET / 'migration.sql').read_text())
        assert sql("SELECT count(*) FROM torrents WHERE metadata_status='pending' AND metadata IS NULL AND metadata_error IS NULL AND metadata_fetched_at IS NULL") == '3'
        assert sql("SELECT jsonb_agg(to_jsonb(t) - ARRAY['metadata','metadata_status','metadata_error','metadata_fetched_at'] ORDER BY id) FROM torrents t") == before
        assert sql("SELECT count(*) FROM pg_proc WHERE proname='torrents_subtitle_info'") == '0'
        sql("""UPDATE torrents SET parse_version=1,
            parse_result='{"subtitleInfo":{"languages":["zh"],"multi":false,"delivery":[]}}',
            metadata='{"status":"known","subtitleInfo":{"languages":["en","zh-Hant"],"multi":true,"delivery":["muxed"]}}',
            metadata_status='failed' WHERE hash='1';
            UPDATE torrents SET subtitle_has_chs=true, subtitle_type='内挂' WHERE hash='2';
            UPDATE torrents SET parse_version=1, parse_result='{"subtitleInfo":null}' WHERE hash='3';""")
        url = f'postgresql://lani_test@localhost/metadata_test?host={quote(directory, safe="")}'
        print(run('node', str(Path(__file__).with_name('torrent-subtitle-federation.cjs')),
            env={**os.environ, 'LANI_METADATA_TEST_DATABASE_URL': url}))
        print('Torrent metadata migration from next passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
