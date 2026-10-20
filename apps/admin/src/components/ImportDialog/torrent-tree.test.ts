import { torrentDirectoryEntries } from './torrent-tree';

const files = [
  { path: 'Season/01.mkv', size: 100 },
  { path: 'Season/02.mkv', size: 200 },
  { path: 'Season/Extras/SP.mkv', size: 50 },
  { path: 'Season 2/01.mkv', size: 300 },
  { path: 'cover.jpg', size: 10 },
];
it('一次性文件列表构成目录树，根目录去重并排在文件之前', () => {
  expect(
    torrentDirectoryEntries(files, '/').map((entry) => entry.path),
  ).toEqual(['/Season', '/Season 2', '/cover.jpg']);
});
it('只显示当前层级，保留长度，不混入名称前缀相似的目录', () => {
  expect(torrentDirectoryEntries(files, '/Season')).toEqual([
    {
      name: 'Extras',
      path: '/Season/Extras',
      type: 'DIRECTORY',
      size: null,
      lastModified: '',
    },
    {
      name: '01.mkv',
      path: '/Season/01.mkv',
      type: 'FILE',
      size: '100',
      lastModified: '',
    },
    {
      name: '02.mkv',
      path: '/Season/02.mkv',
      type: 'FILE',
      size: '200',
      lastModified: '',
    },
  ]);
  expect(torrentDirectoryEntries(files, '/missing')).toEqual([]);
});
