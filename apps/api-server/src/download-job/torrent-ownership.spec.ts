import { WriteGate } from '@/application-state/write-gate';
const openGate = () => {
  const gate = new WriteGate();
  gate.open();
  return gate;
};
import { PrismaClient } from '@lani/db';
import { DownloadJobService } from './index.service';

jest.mock('@/config', () => ({ __esModule: true, default: { jellyfin: {} } }));

it('exposes confirmed ownership and active usage without leaking task states', async () => {
  const task = (
    hash: string | null,
    legacyStage = 'AVAILABLE',
    flags = {},
  ) => ({
    qbtTorrentHash: hash,
    legacyStage,
    isCancelled: false,
    isFailed: false,
    ...flags,
  });
  const a = 'A'.repeat(40);
  const b = 'b'.repeat(40);
  const c = 'c'.repeat(40);
  const d = 'd'.repeat(64);
  const findMany = jest
    .fn()
    .mockResolvedValue([
      task(a),
      task(a, 'DOWNLOADING'),
      task(b, 'DOWNLOAD_SUBMITTING', { isFailed: true }),
      task(c, 'IMPORTING', { isCancelled: true }),
      task(d, 'DOWNLOADING', { isFailed: true }),
      task(null),
    ]);
  const service = new DownloadJobService(
    { task: { findMany } } as any,
    {} as any,
    openGate(),
  );
  expect(await service.getTorrentOwnership()).toEqual({
    owned: new Set([a.toLowerCase(), c, d]),
    active: new Set([a.toLowerCase()]),
  });
  expect(findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        type: { in: ['DOWNLOAD', 'BATCH_DOWNLOAD'] },
        qbtTorrentHash: { not: null },
      },
    }),
  );
});

const databaseUrl = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
const databaseTests = databaseUrl ? describe : describe.skip;
databaseTests('scoped torrent ownership in PostgreSQL', () => {
  it('matches uppercase stored identities, excludes unrelated tasks and handles empty identities', async () => {
    const db = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    const ids: number[] = [];
    try {
      const stored = 'AB'.repeat(32);
      for (const qbtTorrentHash of [stored, 'cd'.repeat(20)]) {
        const task = await db.task.create({
          data: {
            type: 'BATCH_DOWNLOAD',
            legacyStage: 'DOWNLOADING',
            qbtTorrentHash,
          },
        });
        ids.push(task.id);
      }
      const service = new DownloadJobService(db as any, {} as any, openGate());
      expect(
        await service.getTorrentOwnership([stored.toLowerCase(), stored]),
      ).toEqual({
        owned: new Set([stored.toLowerCase()]),
        active: new Set([stored.toLowerCase()]),
      });
      expect(await service.getTorrentOwnership([])).toEqual({
        owned: new Set(),
        active: new Set(),
      });
    } finally {
      await db.task.deleteMany({ where: { id: { in: ids } } });
      await db.$disconnect();
    }
  });
});
