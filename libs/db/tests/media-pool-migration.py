"""验证媒体池最终迁移保留旧任务，并限制当前版本归属和外部链接类型。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'
TARGET = '20261028000000_media_pool'


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-media-migration-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        run('createdb', '-h', directory, '-U', 'lani_test', 'media_test')

        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'media_test',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name < TARGET:
                sql(migration.read_text())
        sql("""INSERT INTO jellyfin_folders(name,jellyfin_id,location) VALUES ('media','media','/tmp');
            INSERT INTO seasons(title,jellyfin_folder_id,tags) SELECT 'old',id,'{}' FROM jellyfin_folders;
            INSERT INTO episodes(season_id,index,jellyfin_episode_id) SELECT id,1,'legacy' FROM seasons;
            INSERT INTO episodes(season_id,index) SELECT id,2 FROM seasons;
            INSERT INTO download_jobs(episode_id,torrent_link,status) SELECT id,'legacy','AVAILABLE' FROM episodes WHERE index=1;""")
        before_episodes = sql('SELECT jsonb_agg(to_jsonb(e) ORDER BY id) FROM episodes e')
        before_tasks = sql('SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM download_jobs t')
        sql((MIGRATIONS / TARGET / 'migration.sql').read_text())
        assert sql("SELECT jsonb_agg(to_jsonb(e) - 'current_version_id' ORDER BY id) FROM episodes e") == before_episodes
        assert sql('SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM download_jobs t') == before_tasks
        sql("""INSERT INTO episode_versions(episode_id,registration_key)
            SELECT id,'legacy' FROM episodes WHERE index=1;
            UPDATE episodes SET current_version_id=(SELECT id FROM episode_versions) WHERE index=1;""")
        try:
            sql('UPDATE episodes SET current_version_id=(SELECT id FROM episode_versions) WHERE index=2')
            raise AssertionError('cross-episode current version was accepted')
        except RuntimeError:
            pass
        for statement in [
            "INSERT INTO media_assets(id,size,pool_path,pool_identity) VALUES ('invalid',1,'/pool','{}')",
            "INSERT INTO media_assets(id,size,pool_path,pool_identity,download_path,download_mode) VALUES ('00000000-0000-4000-8000-000000000001',1,'/pool','{}','/download','copy')",
        ]:
            try:
                sql(statement)
                raise AssertionError('invalid media state was accepted')
            except RuntimeError:
                pass
        assert sql("SELECT to_regclass('media_publications') IS NULL") == 't'
        assert sql("SELECT count(*) FROM information_schema.columns WHERE table_name='episode_versions' AND column_name IN ('number','source','operation_key')") == '0'
        asset_id = '00000000-0000-4000-8000-000000000001'
        sql(f"INSERT INTO media_assets(id,size,pool_path,pool_identity) VALUES ('{asset_id}',1,'/pool/file','{{}}')")
        for invalid_path in ['/absolute.mkv', '../escape.mkv', 'Season 1/../../escape', 'a//b', 'a/./b', 'a/', 'C:video', 'a\\b']:
            escaped = invalid_path.replace("'", "''")
            try:
                sql(f"INSERT INTO episode_version_files(version_id,asset_id,target_path,role) SELECT id,'{asset_id}','{escaped}','video' FROM episode_versions")
                raise AssertionError(f'invalid relative layout accepted: {invalid_path}')
            except RuntimeError:
                pass
        sql(f"INSERT INTO episode_version_files(version_id,asset_id,target_path,role) SELECT id,'{asset_id}','Season 1/Episode.mkv','video' FROM episode_versions")
        for table in ['media_assets', 'episode_versions', 'episode_version_files']:
            assert sql(f"SELECT obj_description('{table}'::regclass)") == '@omit'
        assert sql("SELECT col_description('episodes'::regclass, attnum) FROM pg_attribute WHERE attrelid='episodes'::regclass AND attname='current_version_id'") == '@omit create,update'
        print('Media pool migration passed: history, ownership, link constraints, smart comments')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
