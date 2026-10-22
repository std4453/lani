"""验证匹配迁移保留已有种子，直接建立最终表结构及约束。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATIONS = Path(__file__).resolve().parents[1] / 'prisma/migrations'
TARGET = '20261026000000_torrent_matching'


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-matching-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        run('createdb', '-h', directory, '-U', 'lani_test', 'matching_test')

        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'matching_test',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        for migration in sorted(MIGRATIONS.glob('*/migration.sql')):
            if migration.parent.name < TARGET:
                sql(migration.read_text())
        sql("""INSERT INTO torrents(title,hash,torrent_link,size,publish_date)
          VALUES ('existing torrent','existing-torrent','local',1,now());""")
        before = sql('SELECT to_jsonb(t) FROM torrents t')
        sql("INSERT INTO background_jobs(queue_name,key,payload) VALUES ('torrent-retention','existing','{}')")
        previous_job = sql('SELECT to_jsonb(j) FROM background_jobs j')
        sql((MIGRATIONS / TARGET / 'migration.sql').read_text())
        assert sql("SELECT to_jsonb(t) - ARRAY['matched_season_id','match_details','matched_at','match_status'] FROM torrents t") == before
        assert sql("SELECT match_status IS NULL AND match_details IS NULL AND matched_season_id IS NULL AND matched_at IS NULL FROM torrents") == 't'
        assert sql('SELECT to_jsonb(j) FROM background_jobs j') == previous_job
        assert sql('SELECT count(*) FROM torrent_match_catalog') == '0'
        assert sql("SELECT count(*) FROM pg_trigger WHERE tgrelid='torrents'::regclass AND NOT tgisinternal") == '0'
        sql("UPDATE torrents SET title='updated title', match_status='NO_MATCH', match_details=jsonb_build_object('reason','no_candidates')")
        assert sql('SELECT to_jsonb(j) FROM background_jobs j') == previous_job
        assert sql("SELECT obj_description('torrents'::regclass)") == '@omit create,update'
        assert sql("SELECT obj_description('background_jobs'::regclass)") == '@omit'
        assert sql("SELECT obj_description('torrent_match_catalog'::regclass)") == '@omit'
        sql("INSERT INTO background_jobs(queue_name,key,payload) VALUES ('code-defined-queue','one','{}')")
        assert sql("SELECT status || ':' || attempts::text FROM background_jobs WHERE queue_name='code-defined-queue'") == 'pending:0'
        sql("INSERT INTO torrent_match_catalog DEFAULT VALUES")
        assert sql("SELECT id=1 AND state='{}'::jsonb FROM torrent_match_catalog") == 't'
        for invalid in [
            "UPDATE background_jobs SET status='invalid'",
            "UPDATE background_jobs SET attempts=-1",
            "INSERT INTO background_jobs(queue_name,key,payload) VALUES ('code-defined-queue','one','{}')",
            "INSERT INTO torrent_match_catalog(id) VALUES (2)",
            "UPDATE torrents SET match_status='invalid'",
        ]:
            try:
                sql(invalid)
            except RuntimeError:
                pass
            else:
                raise AssertionError('Invalid data was accepted: ' + invalid)
        print('Torrent matching migration passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
