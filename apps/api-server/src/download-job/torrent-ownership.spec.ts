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
