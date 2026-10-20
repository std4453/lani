"""验证季度别名迁移的历史数据、默认值和数组约束。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'
TARGET = '20261023000000_season_aliases'


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-aliases-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        run('createdb', '-h', directory, '-U', 'lani_test', 'aliases_test')

        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'aliases_test',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name < TARGET:
                sql(migration.read_text())
        sql("""INSERT INTO jellyfin_folders(name,jellyfin_id,location)
            VALUES ('alias regression','alias-regression','/tmp');
            INSERT INTO seasons(title,jellyfin_folder_id,tags)
            SELECT 'existing season',id,'{}' FROM jellyfin_folders;""")
        before = sql("SELECT to_jsonb(s) FROM seasons s")
        sql((MIGRATIONS / TARGET / 'migration.sql').read_text())
        assert sql("SELECT aliases = '{}'::text[] FROM seasons") == 't'
        assert sql("SELECT to_jsonb(s) - 'aliases' FROM seasons s") == before
        sql("""INSERT INTO seasons(title,jellyfin_folder_id,tags)
            SELECT 'new season',id,'{}' FROM jellyfin_folders;""")
        assert sql("SELECT count(*) FROM seasons WHERE aliases = '{}'::text[]") == '2'
        assert sql("SELECT attnotnull FROM pg_attribute WHERE attrelid='seasons'::regclass AND attname='aliases'") == 't'
        sql("UPDATE seasons SET aliases=ARRAY['existing season','日本語','中文'] WHERE title='existing season'")
        assert sql("SELECT array_to_json(aliases) FROM seasons WHERE title='existing season'") == '["existing season","日本語","中文"]'
        print('Season aliases migration passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
