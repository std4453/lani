import { QBittorrentService } from './QBittorrentService';
import { AxiosService, HttpRequestError } from '@/common/axios.service';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    downloadClient: {
      qbittorrent: {
        apiEndpoint: 'http://localhost',
        username: 'test',
        password: 'test',
      },
    },
    network: { timeout: 1000 },
  },
}));
afterEach(() => jest.restoreAllMocks());
it('sends one bounded form request and always preserves files', async () => {
  const client = new QBittorrentService();
  jest.spyOn(client, 'ensureCredentials').mockResolvedValue();
  const request = jest
    .spyOn(AxiosService.prototype, 'request')
    .mockResolvedValue({} as any);
  const hashes = ['a'.repeat(40), 'b'.repeat(64)];
  await client.deleteTorrentsKeepFiles(hashes);
  expect(request).toHaveBeenCalledTimes(1);
  const data = new URLSearchParams(request.mock.calls[0][0].data as string);
  expect(data.get('hashes')).toBe(hashes.join('|'));
  expect(data.get('deleteFiles')).toBe('false');
  expect(
    Buffer.byteLength(
      new URLSearchParams({
        hashes: Array(100).fill('b'.repeat(64)).join('|'),
        deleteFiles: 'false',
      }).toString(),
    ),
  ).toBeLessThan(8192);
});
it.each([403, 413, 500])(
  'never replays a delete after HTTP %s',
  async (status) => {
    const client = new QBittorrentService();
    jest.spyOn(client, 'ensureCredentials').mockResolvedValue();
    const request = jest
      .spyOn(AxiosService.prototype, 'request')
      .mockRejectedValue(new HttpRequestError('failure', status));
    await expect(
      client.deleteTorrentsKeepFiles(['a'.repeat(40)]),
    ).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  },
);
it('rejects all, malformed hashes and oversized batches before any request', async () => {
  const client = new QBittorrentService();
  const credentials = jest.spyOn(client, 'ensureCredentials');
  for (const hashes of [['all'], ['x'], Array(101).fill('a'.repeat(40))])
    await expect(client.deleteTorrentsKeepFiles(hashes)).rejects.toThrow();
  await client.deleteTorrentsKeepFiles([]);
  expect(credentials).not.toHaveBeenCalled();
});
