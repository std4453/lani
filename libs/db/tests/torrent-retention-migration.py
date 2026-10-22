"""验证清理队列可独立安装，并保留已有共享队列数据。"""
from pathlib import Path
import subprocess
import tempfile

MIGRATION = Path(__file__).resolve().parents[1] / 'prisma/migrations/20261025000000_torrent_retention_queue/migration.sql'


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


with tempfile.TemporaryDirectory(prefix='lani-retention-test-') as directory:
    data = str(Path(directory) / 'data')
    run('initdb', '-D', data, '-A', 'trust', '-U', 'lani_test', '--no-locale')
    run('pg_ctl', '-D', data, '-l', str(Path(directory) / 'postgres.log'),
        '-o', f"-k {directory} -c listen_addresses=''", '-w', 'start')
    try:
        run('createdb', '-h', directory, '-U', 'lani_test', 'retention_test')

        def sql(statement):
            return run('psql', '-X', '-h', directory, '-U', 'lani_test', '-d', 'retention_test',
                       '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement)

        sql(MIGRATION.read_text())
        sql("INSERT INTO background_jobs(queue_name,key,payload) VALUES ('existing','a','{}')")
        before = sql('SELECT to_jsonb(j) FROM background_jobs j')
        sql(MIGRATION.read_text())
        assert sql('SELECT to_jsonb(j) FROM background_jobs j') == before
        assert sql("SELECT obj_description('background_jobs'::regclass)") == '@omit'
        assert sql("SELECT status || ':' || revision || ':' || attempts FROM background_jobs") == 'pending:1:0'
        sql("INSERT INTO background_jobs(queue_name,key,payload) VALUES ('torrent-retention','scan','{\"hashes\":[]}')")
        assert sql('SELECT count(*) FROM background_jobs') == '2'
        print('Torrent retention migration passed')
    finally:
        run('pg_ctl', '-D', data, '-m', 'immediate', '-w', 'stop')
