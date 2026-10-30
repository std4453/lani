import { QBittorrentClient } from './QBittorrentClient';
jest.mock('@/config', () => ({
  __esModule: true,
  default: { network: { timeout: { local: 100 } } },
}));

it('仅从种子列表获取做种者和下载者，不额外请求完成次数', async () => {
  const qbt = {
    resolveTorrents: jest.fn(
      async () =>
        new Map([
          [
            'abc',
            {
              hash: 'abc',
              dlspeed: 123,
              downloaded: 20,
              size: 100,
              eta: 6,
              completion_on: 0,
              num_seeds: 6,
              num_leechs: 3,
              num_complete: 90,
            },
          ],
        ]),
    ),
  };
  const client = new QBittorrentClient(qbt as never, {} as never);
  expect(await client.getActiveTorrentsStatus(['abc'])).toEqual([
    {
      hash: 'abc',
      speed: 123,
      downloaded: 20,
      total: 100,
      eta: 6,
      seeds: 6,
      peers: 3,
    },
  ]);
  expect(qbt.resolveTorrents).toHaveBeenCalledTimes(1);
  expect(await client.getActiveTorrentsStatus([])).toEqual([]);
  expect(qbt.resolveTorrents).toHaveBeenCalledTimes(1);
});

it.each([3847173000, -1, Infinity, NaN, undefined])(
  '不可表示的 ETA %s 不影响下载进度，完成的任务仍返回 0',
  async (eta) => {
    const pending = {
      hash: 'pending',
      dlspeed: 1,
      downloaded: 100,
      size: 1000,
      eta,
      completion_on: 0,
      num_seeds: 1,
      num_leechs: 0,
    };
    const qbt = {
      resolveTorrents: jest.fn(
        async () =>
          new Map([
            ['pending', pending],
            ['done', { ...pending, hash: 'done', completion_on: 123 }],
          ]),
      ),
    };
    const client = new QBittorrentClient(qbt as never, {} as never);
    const result = await client.getActiveTorrentsStatus(['pending', 'done']);
    expect(result[0]).toMatchObject({
      downloaded: 100,
      total: 1000,
      eta: undefined,
    });
    expect(result[1]).toMatchObject({ eta: 0, speed: 0 });
  },
);
