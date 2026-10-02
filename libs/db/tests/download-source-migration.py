"""Run with python3; requires initdb, pg_ctl and psql on PATH (non-root).

Uses an isolated temporary PostgreSQL cluster, never DATABASE_URL.
Exercises the actual migrations and enqueue SQL from the service.
"""
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
MIGRATIONS = ROOT / 'libs/db/prisma/migrations'
SERVICE = ROOT / 'apps/api-server/src/download-job/index.service.ts'
query = re.search(r'>`\s*(SELECT\s+DISTINCT ON.*?)`;', SERVICE.read_text(), re.S)
assert query, 'Cannot locate enqueueDownloadJobs SQL'


def run(*args, **kwargs):
    result = subprocess.run(args, text=True, capture_output=True, **kwargs)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-download-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'postgres',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', input=statement)

        migrations = sorted(MIGRATIONS.glob('*/migration.sql'))
        # Simulate the metadata table that Prisma creates before migrations.
        sql('CREATE TABLE "_prisma_migrations" (id text PRIMARY KEY);')
        sql(migrations[0].read_text())
        sql("""
            INSERT INTO jellyfin_folders (id, name, jellyfin_id, location)
                VALUES (1, 'test', 'folder', '/tmp/test');
            INSERT INTO seasons (id, title, jellyfin_folder_id, jellyfin_id)
                SELECT n, 'season-' || n, 1, 'series-' || n FROM generate_series(1, 4) n;
            INSERT INTO download_sources (season_id, pattern) VALUES (1, 'Shared %');
            INSERT INTO episodes (id, season_id, index, air_time)
                VALUES (1, 1, 1, now() - interval '1 day'),
                       (2, 2, 1, now() - interval '1 day'),
                       (3, 3, 1, now() - interval '1 day'),
                       (4, 4, 1, now() - interval '1 day');
            INSERT INTO torrents (title, torrent_link, size, publish_date, hash, episode_index)
                VALUES ('Shared 1', 'torrent-1', 1, now(), 'hash-1', 1),
                       ('Shared 13', 'torrent-13', 1, now(), 'hash-13', 13);
        """)
        before = sql('SELECT row_to_json(d) FROM download_sources d ORDER BY id')
        assert sql(query[1]) == '1|torrent-1'
        for migration in migrations[1:]:
            sql(migration.read_text())
        assert before == sql('SELECT row_to_json(d) FROM download_sources d ORDER BY id')
        assert sql(query[1]) == '1|torrent-1'
        assert sql("SELECT obj_description('download_sources'::regclass)") == (
            '@omit delete,create,update\n@unique season_id,pattern')
        assert sql("SELECT to_regclass('download_sources_pattern_key') IS NULL") == 't'
        assert sql("SELECT obj_description('\"_prisma_migrations\"'::regclass)") == '@omit'
        sql("""
            INSERT INTO download_sources (season_id, pattern, "offset", is_disabled)
                VALUES (2, 'Shared %', 12, false), (3, 'Shared %', 0, true),
                       (1, 'Shared 1%', 0, false);
            DO $$ BEGIN
                BEGIN
                    INSERT INTO download_sources (season_id, pattern) VALUES (1, 'Shared %');
                    RAISE EXCEPTION 'Same-season duplicate was accepted';
                EXCEPTION WHEN unique_violation THEN NULL;
                END;
            END $$;
        """)
        # Shared pattern, independent offsets, overlapping rules, disabled source,
        # and a season without a source: exactly one candidate per eligible episode.
        assert sorted(sql(query[1]).splitlines()) == ['1|torrent-1', '2|torrent-13']
        sql("INSERT INTO download_jobs (episode_id, status) VALUES (1, 'DOWNLOAD_SUBMITTING')")
        assert sql(query[1]) == '2|torrent-13'
        sql("UPDATE episodes SET air_time = now() + interval '1 day' WHERE id = 2")
        assert sql(query[1]) == ''
        sql("UPDATE episodes SET air_time = now() - interval '1 day', jellyfin_episode_id = 'existing' WHERE id = 2")
        assert sql(query[1]) == ''
        sql("UPDATE episodes SET jellyfin_episode_id = NULL WHERE id = 2")
        sql("UPDATE seasons SET jellyfin_id = '' WHERE id = 2")
        assert sql(query[1]) == ''
        # Fresh installations must also accept the full migration chain.
        sql('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
        for migration in migrations:
            sql(migration.read_text())
        assert sql("SELECT to_regclass('download_sources_season_id_pattern_key') IS NOT NULL") == 't'
        # Older manually managed databases may have a real UNIQUE constraint.
        sql('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
        sql(migrations[0].read_text())
        sql('ALTER TABLE download_sources ADD CONSTRAINT download_sources_pattern_key '
            'UNIQUE USING INDEX download_sources_pattern_key;')
        for migration in migrations[1:]:
            sql(migration.read_text())
        assert sql("SELECT to_regclass('download_sources_pattern_key') IS NULL") == 't'
        assert sql("SELECT to_regclass('download_sources_season_id_pattern_key') IS NOT NULL") == 't'
        print('PASS: populated upgrade, fresh install, index/constraint variants, data preservation and enqueue SQL')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
