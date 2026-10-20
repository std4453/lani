import { toTorrentFile } from '@ctrl/torrent-file';
import { readTorrentFiles } from './torrent-files';

const encode = (info: object) => Buffer.from(toTorrentFile({ info }));
it.each(['v1', 'v2', 'hybrid'])('读取 %s 种子的文件树与长度', (version) => {
  const v1 = {
    files: [{ path: ['01.mkv'], length: 1 }],
    pieces: Buffer.alloc(20),
  };
  const v2 = {
    'meta version': 2,
    'file tree': {
      '01.mkv': { '': { length: 1, 'pieces root': Buffer.alloc(32) } },
    },
  };
  expect(
    readTorrentFiles(
      encode({
        name: 'Season',
        'piece length': 16384,
        ...(version !== 'v2' ? v1 : {}),
        ...(version !== 'v1' ? v2 : {}),
      }),
    ),
  ).toEqual([{ path: 'Season/01.mkv', size: 1 }]);
});
it.each(['../bad', '/absolute', 'C:\\bad', 'a/../b', 'a//b', 'a\0b'])(
  '拒绝危险种子路径 %s',
  (name) => {
    expect(() =>
      readTorrentFiles(
        encode({
          name,
          length: 1,
          'piece length': 16384,
          pieces: Buffer.alloc(20),
        }),
      ),
    ).toThrow();
  },
);
it('拒绝重复路径和损坏的种子', () => {
  expect(() => readTorrentFiles(Buffer.from('bad'))).toThrow();
  expect(() =>
    readTorrentFiles(
      encode({
        name: 'Season',
        files: [
          { path: ['01.mkv'], length: 1 },
          { path: ['01.mkv'], length: 1 },
        ],
        'piece length': 16384,
        pieces: Buffer.alloc(20),
      }),
    ),
  ).toThrow('重复');
});
