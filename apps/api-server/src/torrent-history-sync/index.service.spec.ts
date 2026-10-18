jest.mock('@/mikan-sync/index.service', () => ({ MikanSyncService: class {} }));
jest.mock('@/nyaa-sync/index.service', () => ({ NyaaSyncService: class {} }));
import { TorrentHistorySyncService } from './index.service';

function setup() {
  let complete: (count: number) => void = () => undefined;
  const mikan = { syncMikanHistory: jest.fn().mockResolvedValue(3) };
  const nyaa = {
    syncNyaaHistory: jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    ),
  };
  const service = new TorrentHistorySyncService(mikan as any, nyaa as any);
  return { service, mikan, nyaa, complete: () => complete(7) };
}
async function flush() {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

it('returns an ID immediately, starts both sources once and completes only after both finish', async () => {
  const { service, mikan, nyaa, complete } = setup();
  const id = service.start();
  expect(id).toMatch(/^[0-9a-f-]{36}$/);
  expect(service.start()).toBe(id);
  expect(mikan.syncMikanHistory).toHaveBeenCalledTimes(1);
  expect(nyaa.syncNyaaHistory).toHaveBeenCalledTimes(1);
  await flush();
  expect(service.status(id)).toEqual({ running: true, error: null });
  complete();
  await flush();
  expect(service.status(id)).toEqual({ running: false, error: null });
  expect(service.start()).not.toBe(id);
  complete();
  await flush();
});

it.each(['mikan', 'nyaa'] as const)(
  'reports %s failure after both sources settle and permits retry',
  async (source) => {
    const { service, mikan, nyaa, complete } = setup();
    const failed =
      source === 'mikan' ? mikan.syncMikanHistory : nyaa.syncNyaaHistory;
    failed.mockRejectedValueOnce(new Error('upstream failed'));
    const id = service.start();
    complete();
    await flush();
    expect(service.status(id)).toEqual({
      running: false,
      error: expect.stringContaining('已入库的种子保留'),
    });
    expect(service.start()).not.toBe(id);
    complete();
    await flush();
  },
);

it('rejects unknown and stale IDs, including after a restart', async () => {
  const { service, complete } = setup();
  expect(() => service.status('unknown')).toThrow('重新同步');
  const id = service.start();
  complete();
  await flush();
  service.start();
  expect(() => service.status(id)).toThrow('重新同步');
  expect(() => setup().service.status(id)).toThrow('重新同步');
  complete();
  await flush();
});
