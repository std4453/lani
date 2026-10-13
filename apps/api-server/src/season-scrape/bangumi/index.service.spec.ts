import { BangumiAPIService } from '@/api/bangumi';
import { BangumiSeasonService } from './index.service';
jest.mock('@/api/bangumi', () => ({
  BangumiAPIService: { getEpisodes: jest.fn() },
  EpType: { MainStory: 0, SP: 1 },
}));
const getEpisodes = BangumiAPIService.getEpisodes as jest.Mock;
const row = (id: number, type: number, ep: number, sort: number) => ({
  id,
  type,
  ep,
  sort,
  airdate: '',
  name: `Episode ${id}`,
  name_cn: '',
  desc: '',
});
beforeEach(() => getEpisodes.mockReset());
it('preserves ep, SP sort and undated source metadata', async () => {
  getEpisodes.mockResolvedValue({
    total: 4,
    data: [
      row(1, 0, 0, 0),
      row(2, 0, 12.5, 12.5),
      row(3, 1, 0, 1),
      row(4, 2, 0, 1),
    ],
  });
  const result = await new BangumiSeasonService().fetch(
    { episodes: true },
    '253',
  );
  expect(
    result.episodes?.map((e) => [
      e.episodeType,
      e.episodeNumber,
      e.bangumiEpisodeId,
    ]),
  ).toEqual([
    ['EPISODE', '0', 1],
    ['EPISODE', '12.5', 2],
    ['SP', '1', 3],
  ]);
  expect(result.episodes?.[2]).toMatchObject({
    bangumiSort: '1',
    sourceData: { type: 1, ep: 0, sort: 1 },
  });
  expect(result.episodes?.[2].airDate).toBeUndefined();
  expect(getEpisodes).toHaveBeenCalledWith(253, undefined, 100, 0);
});
it('paginates before filtering unsupported chapter types', async () => {
  getEpisodes
    .mockResolvedValueOnce({ total: 2, data: [row(1, 2, 0, 1)] })
    .mockResolvedValueOnce({ total: 2, data: [row(2, 1, 0, 2)] });
  expect(
    (await new BangumiSeasonService().fetch({ episodes: true }, '253'))
      .episodes,
  ).toHaveLength(1);
  expect(getEpisodes).toHaveBeenNthCalledWith(2, 253, undefined, 100, 1);
});
it('rejects incomplete pages and invalid precision', async () => {
  getEpisodes
    .mockResolvedValueOnce({ total: 2, data: [row(1, 0, 1, 1)] })
    .mockResolvedValueOnce({ total: 2, data: [] });
  await expect(
    new BangumiSeasonService().fetch({ episodes: true }, '253'),
  ).rejects.toThrow('empty page');
  getEpisodes.mockResolvedValue({ total: 1, data: [row(1, 0, 1.1234, 1)] });
  await expect(
    new BangumiSeasonService().fetch({ episodes: true }, '253'),
  ).rejects.toThrow('invalid number');
});
