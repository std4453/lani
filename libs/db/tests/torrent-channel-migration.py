"""在隔离 PostgreSQL 中验证种子编号回填、来源默认值和 hash 唯一约束。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'


def run(*args, **kwargs):
    result = subprocess.run(args, text=True, capture_output=True, **kwargs)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-torrent-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'postgres',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', input=statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name == '20261018000000_torrent_channels':
                sql("""
                    INSERT INTO torrents (id, title, torrent_link, size, publish_date, hash)
                    VALUES (7, 'first', 'link-1', 1, now(), 'hash-1'),
                           (900, 'second', 'link-2', 2, now(), 'hash-2');
                """)
            sql(migration.read_text())
        assert sql('SELECT id, display_id, channel, permalink IS NULL FROM torrents ORDER BY id') == (
            '7|1|MIKAN|t\n900|2|MIKAN|t')
        sql("""
            INSERT INTO torrents (title, torrent_link, size, publish_date, hash, channel, permalink)
            VALUES ('third', 'link-3', 3, now(), 'hash-3', 'NYAA', 'https://nyaa.si/view/123');
        """)
        assert sql("SELECT display_id, channel FROM torrents WHERE hash = 'hash-3'") == '3|NYAA'
        sql("""
            INSERT INTO torrents (title, torrent_link, size, publish_date, hash, channel)
            VALUES ('duplicate', 'link-4', 4, now(), 'hash-3', 'MIKAN')
            ON CONFLICT (hash) DO NOTHING;
        """)
        assert sql('SELECT count(*) FROM torrents') == '3'
        assert sql("SELECT channel, title FROM torrents WHERE hash = 'hash-3'") == 'NYAA|third'
        # 空表迁移后第一个编号也应为 1。
        sql('DROP TABLE torrents CASCADE; DROP TYPE torrent_channel;')
        sql('CREATE TABLE torrents (id integer PRIMARY KEY);')
        sql((MIGRATIONS / '20261018000000_torrent_channels/migration.sql').read_text())
        assert sql('INSERT INTO torrents (id) VALUES (123) RETURNING display_id') == '1'
        print('Torrent channel migration checks passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
