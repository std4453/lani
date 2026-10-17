import { toTorrentFile } from '@ctrl/torrent-file';
import { createHash } from 'crypto';
import { parseTorrentInput } from './torrent-input';

const name = 'sample.txt';
const v1Info = {
  name,
  'piece length': 16384,
  length: 1,
  pieces: createHash('sha1').update('x').digest(),
};
const v2Info = {
  name,
  'piece length': 16384,
  'meta version': 2,
  'file tree': {
    [name]: {
      '': {
        length: 1,
        'pieces root': createHash('sha256').update('x').digest(),
      },
    },
  },
};

it.each([
  ['v1', v1Info, 'sha1'],
  ['hybrid', { ...v1Info, ...v2Info }, 'sha1'],
  ['v2', v2Info, 'sha256'],
] as const)('解析 %s 文件，保留正确的内容身份', (kind, info, algorithm) => {
  const buffer = Buffer.from(toTorrentFile({ info }));
  // 顶层仅包含 info：d4:info<原始字节>e，独立计算期望值。
  const expected = createHash(algorithm)
    .update(buffer.subarray(7, -1))
    .digest('hex');
  const clientHash = createHash(kind === 'v1' ? 'sha1' : 'sha256')
    .update(buffer.subarray(7, -1))
    .digest('hex')
    .slice(0, 40);
  expect(parseTorrentInput(buffer)).toEqual({
    hash: expected,
    clientHash,
    name,
  });
});

const v1 = 'a'.repeat(40);
const v2 = 'b'.repeat(64);
it.each([
  [`magnet:?xt=urn:btih:${v1.toUpperCase()}`, v1, v1],
  [`magnet:?xt=urn:btmh:1220${v2}`, v2, v2.slice(0, 40)],
  [`magnet:?xt=urn:btih:${v1}&xt=urn:btmh:1220${v2}`, v1, v2.slice(0, 40)],
  [
    `magnet:?xt=${encodeURIComponent(`urn:btmh:1220${v2}`)}`,
    v2,
    v2.slice(0, 40),
  ],
  [
    'magnet:?xt=urn:btih:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '0'.repeat(40),
    '0'.repeat(40),
  ],
])('接受有效磁力身份 %s', (uri, hash, clientHash) => {
  expect(parseTorrentInput(uri + '&dn=test+file')).toEqual({
    hash,
    clientHash,
    name: 'test file',
  });
});

it.each([
  'magnet:?dn=no-hash',
  `magnet:?xt=urn:btmh:1220${'z'.repeat(64)}`,
  `magnet:?xt=urn:btmh:1220${v2}extra`,
  `magnet:?xt=urn:btmh:1220${v2.slice(1)}`,
  `magnet:?xt=urn:btih:${v1}&xt=urn:btih:${'c'.repeat(40)}`,
  `https://example.org/?xt=urn:btih:${v1}`,
])('拒绝无效或冲突的身份 %s', (uri) => {
  expect(() => parseTorrentInput(uri)).toThrow();
});

it('拒绝无效种子及不支持的元数据版本', () => {
  expect(() => parseTorrentInput(Buffer.from('invalid'))).toThrow();
  expect(() =>
    parseTorrentInput(
      Buffer.from(toTorrentFile({ info: { ...v2Info, 'meta version': 3 } })),
    ),
  ).toThrow();
});
