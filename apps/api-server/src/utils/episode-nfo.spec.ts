import { episodeNfo } from './episode-nfo';

it('在单集NFO保留lani默认ID并写入可直接下载弹幕的ID', () => {
  const nfo = episodeNfo({
    id: 12,
    title: 'one',
    index: 1,
    episodeType: 'EPISODE',
    dandanplayEpisodeId: '186900001',
  } as any);
  expect(nfo.uniqueid).toEqual([
    { $: { type: 'lani', default: 'true' }, _: 12 },
    { $: { type: 'DanmuID' }, _: 'dandan:186900001' },
  ]);
});

it('没有映射时不写入空弹幕ID', () => {
  expect(
    episodeNfo({
      id: 12,
      title: 'one',
      index: 1,
      episodeType: 'EPISODE',
    } as any).uniqueid,
  ).toHaveLength(1);
});
