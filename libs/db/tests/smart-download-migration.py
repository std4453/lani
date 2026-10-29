"""从目标分支历史验证智能下载升级、默认值、约束及原数据保留。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'
TARGET = '20261030000000_smart_download'


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-smart-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        run('createdb', '-h', directory, '-U', 'lani_test', 'smart_test')

        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'smart_test',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name < TARGET:
                sql(migration.read_text())
        sql("""INSERT INTO jellyfin_folders(name,jellyfin_id,location)
            VALUES ('smart regression','smart-regression','/tmp');
            INSERT INTO seasons(title,jellyfin_folder_id,tags)
            SELECT 'existing season',id,'{}' FROM jellyfin_folders;""")
        sql('INSERT INTO episodes(season_id,index) SELECT id,1 FROM seasons')
        sql("INSERT INTO download_jobs(status,episode_id) SELECT 'DOWNLOADING',id FROM episodes")
        task_before = sql('SELECT to_jsonb(t) FROM download_jobs t')
        before = sql('SELECT to_jsonb(s) FROM seasons s')
        sql((MIGRATIONS / TARGET / 'migration.sql').read_text())
        fields = "ARRAY['smart_download_enabled','smart_download_subtitle','smart_download_prefer_baha','smart_download_window_hours','smart_download_timeout_minutes']"
        assert sql(f'SELECT to_jsonb(s) - {fields} FROM seasons s') == before
        assert sql("SELECT to_jsonb(t) - ARRAY['is_smart_download','smart_download_torrent_hash','smart_download_decision','download_timeout_minutes'] FROM download_jobs t") == task_before
        assert sql("SELECT smart_download_enabled || ':' || smart_download_subtitle || ':' || smart_download_prefer_baha || ':' || smart_download_window_hours || ':' || smart_download_timeout_minutes FROM seasons") == 'false:chinese:false:48:120'
        for column, value in [('smart_download_window_hours', '0'),
                              ('smart_download_window_hours', '169'),
                              ('smart_download_timeout_minutes', '-1'),
                              ('smart_download_subtitle', "'unknown'")]:
            try:
                sql(f'UPDATE seasons SET {column}={value}')
            except RuntimeError as error:
                assert 'check constraint' in str(error)
            else:
                raise AssertionError(f'Invalid {column} accepted')
        sql('UPDATE seasons SET smart_download_timeout_minutes=NULL')
        sql('UPDATE seasons SET smart_download_timeout_minutes=0, smart_download_window_hours=168')
        assert sql("SELECT count(*) FROM pg_indexes WHERE indexname='torrents_matched_season_id_publish_date_id_idx'") == '1'
        assert sql("SELECT column_default FROM information_schema.columns WHERE table_name='download_jobs' AND column_name='is_smart_download'") == 'false'
        print('Smart download migration passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
