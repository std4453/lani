import { QBittorrentClient } from './QBittorrentClient';
jest.mock('@/config', () => ({
  __esModule: true,
  default: { network: { timeout: { local: 100 } } },
}));

it('仅从种子列表获取做种者和下载者，不额外请求完成次数', async () => {
  const qbt = {
    listTorrents: jest.fn(async () => [
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
    ]),
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
  expect(qbt.listTorrents).toHaveBeenCalledTimes(1);
  expect(await client.getActiveTorrentsStatus([])).toEqual([]);
  expect(qbt.listTorrents).toHaveBeenCalledTimes(1);
});
