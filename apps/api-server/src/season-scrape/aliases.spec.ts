import { bangumiAliases, normalizeAliases } from './aliases';

it('清理空白和换行，稳定去重且保留大小写与标点差异', () => {
  expect(
    normalizeAliases([
      ' 原名 ',
      '中文\r\n别名',
      '原名',
      '',
      '  ',
      null,
      42,
      {},
      'Original',
      'original',
      'Original!',
      '中文\u2028名称',
    ]),
  ).toEqual([
    '原名',
    '中文 别名',
    'Original',
    'original',
    'Original!',
    '中文 名称',
  ]);
});

it('收集原名、中文名和字符串或数组格式的名称字段', () => {
  expect(
    bangumiAliases('Original', '中文名', [
      { key: '中文名', value: '中文名' },
      { key: '别名', value: '别名一' },
      { key: '别名', value: [{ k: '英文名', v: 'Original' }, { v: '别名二' }] },
      { key: '导演', value: '不应成为别名' },
    ]),
  ).toEqual(['Original', '中文名', '别名一', '别名二']);
});

it.each([
  undefined,
  null,
  {},
  'invalid',
  [null, 12, { key: '别名', value: [null, {}, { v: 1 }, 'invalid'] }],
])('忽略缺失或异常的 infobox 值：%j', (infobox) => {
  expect(bangumiAliases('原名', '', infobox)).toEqual(['原名']);
});
