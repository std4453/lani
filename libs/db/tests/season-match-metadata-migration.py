"""验证季度匹配元数据迁移的数据保留、空值和约束。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'
TARGET = '20261029000000_season_match_metadata'


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-season-match-metadata-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        run('createdb', '-h', directory, '-U', 'lani_test', 'season_match_test')
        command = ['psql', '-X', '-h', directory, '-U', 'lani_test',
                   '-d', 'season_match_test', '-v', 'ON_ERROR_STOP=1', '-Atq', '-c']

        def sql(statement):
            return run(*command, statement)

        def rejected(statement):
            result = subprocess.run([*command, statement], text=True, capture_output=True)
            assert result.returncode != 0, statement

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name < TARGET:
                sql(migration.read_text())
        sql("""INSERT INTO jellyfin_folders(name,jellyfin_id,location)
            VALUES ('match regression','match-regression','/tmp');
            INSERT INTO seasons(title,jellyfin_folder_id,tags)
            SELECT 'existing season',id,'{}' FROM jellyfin_folders;""")
        before = sql("SELECT to_jsonb(s) FROM seasons s")
        sql((MIGRATIONS / TARGET / 'migration.sql').read_text())
        assert sql("SELECT to_jsonb(s) - ARRAY['declared_episode_count','premiere_date'] FROM seasons s") == before
        assert sql("SELECT declared_episode_count IS NULL AND premiere_date IS NULL FROM seasons") == 't'
        sql("""INSERT INTO seasons(title,jellyfin_folder_id,tags)
            SELECT 'new season',id,'{}' FROM jellyfin_folders;""")
        assert sql("SELECT count(*) FROM seasons WHERE declared_episode_count IS NULL AND premiere_date IS NULL") == '2'
        sql("UPDATE seasons SET declared_episode_count=12, premiere_date='2024-02-29'")
        for count in [0, -1, 2147483648]:
            rejected(f'UPDATE seasons SET declared_episode_count={count}')
        for date in ['2026-02-29', '2026-04-31', '2026-1-01', '0000-01-01',
                     '2026-01-01T00:00:00Z', '', 'not-a-date']:
            rejected(f"UPDATE seasons SET premiere_date='{date}'")
        for date in ['0001-01-01', '2000-02-29', '9999-12-31']:
            sql(f"UPDATE seasons SET premiere_date='{date}'")
        sql('UPDATE seasons SET declared_episode_count=NULL, premiere_date=NULL')
        print('Season match metadata migration passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
