import axios from 'axios';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import {
  BaseItemKind,
  ItemFields,
  JellyfinHelp,
  LibraryStructureService,
  MetadataRefreshMode,
  TvShowsService,
} from './index';
import { InjectJellyfinAxiosService } from '@/common/InjectJellyfinAxios.service';
import { LocalAxiosService } from '@/common/axios.service';
import config from '@/config';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: { apiEndpoint: '', apiToken: 'test-token' },
  },
}));

let server: Server;
let requests: { method?: string; url: URL; authorization?: string }[];

beforeAll(async () => {
  requests = [];
  server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    requests.push({
      method: req.method,
      url,
      authorization: req.headers.authorization,
    });
    // 模拟新版服务：只接受标准鉴权和未废弃的查询地址。
    if (
      req.headers.authorization !== 'MediaBrowser Token="test-token"' ||
      req.headers['x-emby-token']
    ) {
      res.writeHead(401).end();
    } else if (url.searchParams.get('parentId') === 'forbidden') {
      res.writeHead(403).end();
    } else if (url.pathname.startsWith('/Users/')) {
      res.writeHead(404).end();
    } else if (url.pathname.endsWith('/Refresh')) {
      res.writeHead(204).end();
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify(
          url.searchParams.has('ids')
            ? {
                Items:
                  url.searchParams.get('ids') === 'missing'
                    ? []
                    : [
                        {
                          Id: 'item',
                          Path: '/media/item.mkv',
                          MediaSources: [],
                        },
                      ],
              }
            : url.pathname === '/Library/VirtualFolders'
            ? [{ Name: 'Anime', ItemId: 'library', Locations: ['/media'] }]
            : {
                Items: [{ Id: 'item', IndexNumber: 1, ParentIndexNumber: 1 }],
                TotalRecordCount: 1,
              },
        ),
      );
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  config.jellyfin.apiEndpoint = `http://127.0.0.1:${
    (server.address() as AddressInfo).port
  }/`;
  new InjectJellyfinAxiosService(
    axios.create({ proxy: false }) as unknown as LocalAxiosService,
  );
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

it('使用标准鉴权查询媒体库和剧集', async () => {
  expect(await LibraryStructureService.getVirtualFolders()).toHaveLength(1);
  const episodes = await TvShowsService.getEpisodes('series', 'user');
  expect(episodes.Items?.[0]).toMatchObject({
    Id: 'item',
    IndexNumber: 1,
    ParentIndexNumber: 1,
  });
  expect(requests[requests.length - 1].url.pathname).toBe(
    '/Shows/series/Episodes',
  );
});

it('通过 Items 查询用户可见媒体，保留递归、字段和分页参数', async () => {
  const result = await JellyfinHelp.getItems({
    userId: 'user',
    parentId: 'library',
    includeItemTypes: [BaseItemKind.SERIES],
    fields: [ItemFields.PATH, ItemFields.PROVIDER_IDS],
    recursive: true,
    startIndex: 100,
    limit: 100,
    enableTotalRecordCount: true,
  });
  expect(result.TotalRecordCount).toBe(1);
  const { url } = requests[requests.length - 1];
  expect(url.pathname).toBe('/Items');
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    userId: 'user',
    parentId: 'library',
    recursive: 'true',
    startIndex: '100',
    limit: '100',
    enableTotalRecordCount: 'true',
    includeItemTypes: 'Series',
  });
  expect(url.searchParams.getAll('fields')).toEqual(['Path', 'ProviderIds']);
});

it('按 ID 查询回填所需的路径，缺失条目时停止回填', async () => {
  await expect(
    JellyfinHelp.getItem({ itemId: 'item', userId: 'user' }),
  ).resolves.toMatchObject({ Id: 'item', Path: '/media/item.mkv' });
  const { url } = requests[requests.length - 1];
  expect(url.pathname).toBe('/Items');
  expect(url.searchParams.get('userId')).toBe('user');
  expect(url.searchParams.get('ids')).toBe('item');
  expect(url.searchParams.getAll('fields')).toEqual([
    'Path',
    'MediaSources',
    'MediaStreams',
  ]);
  await expect(
    JellyfinHelp.getItem({ itemId: 'missing', userId: 'user' }),
  ).rejects.toThrow('Jellyfin 媒体条目不存在');
});

it('提交元数据刷新并接受无响应正文的 204', async () => {
  await expect(
    JellyfinHelp.refreshItem({
      itemId: 'series',
      metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    }),
  ).resolves.toBeUndefined();
  const request = requests[requests.length - 1];
  expect(request.method).toBe('POST');
  expect(request.url.pathname).toBe('/Items/series/Refresh');
  expect(request.url.searchParams.has('recursive')).toBe(false);
  expect(request.url.searchParams.get('metadataRefreshMode')).toBe(
    'FullRefresh',
  );
});

it('保留服务端权限拒绝，不把失败视为无媒体', async () => {
  await expect(
    JellyfinHelp.getItems({ userId: 'user', parentId: 'forbidden' }),
  ).rejects.toMatchObject({ status: 403 });
});
