import { PrismaClient } from '@lani/db';
import {
  acquireAdvisoryTransactionLock,
  AdvisoryLockNamespace,
} from './advisory-lock';

const url = process.env.LANI_ADVISORY_LOCK_TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

suite('事务 advisory lock（隔离 PostgreSQL）', () => {
  let db: PrismaClient;
  beforeAll(() => {
    db = new PrismaClient({ datasources: { db: { url } } });
  });
  afterAll(async () => {
    await db.$disconnect();
  });

  it.each([false, true])(
    '串行化同键操作，事务回滚=%s 后释放锁',
    async (rollback) => {
      const locked = deferred();
      const release = deferred();
      const order: string[] = [];
      const namespace = AdvisoryLockNamespace.TorrentSync;
      const first = db
        .$transaction(async (tx) => {
          await acquireAdvisoryTransactionLock(tx, namespace, 1);
          order.push('first');
          locked.resolve();
          await release.promise;
          if (rollback) throw new Error('rollback');
        })
        .catch((error) => error);

      try {
        await Promise.race([
          locked.promise,
          first.then((error) => {
            if (error) throw error;
          }),
        ]);
        const second = db.$transaction(async (tx) => {
          const [state] = await tx.$queryRaw<
            { same: boolean; other: boolean }[]
          >`
          SELECT pg_try_advisory_xact_lock(${namespace}::int4, 1) AS same,
            pg_try_advisory_xact_lock(${namespace}::int4, 2) AS other
        `;
          expect(state).toEqual({ same: false, other: true });
          // 同键只能等第一笔事务结束，不同键互不阻塞。
          const acquired = acquireAdvisoryTransactionLock(tx, namespace, 1);
          release.resolve();
          await acquired;
          order.push('second');
        });
        await second;
        expect(await first).toEqual(
          rollback ? new Error('rollback') : undefined,
        );
        expect(order).toEqual(['first', 'second']);
      } finally {
        release.resolve();
        await first;
      }
    },
  );
});
