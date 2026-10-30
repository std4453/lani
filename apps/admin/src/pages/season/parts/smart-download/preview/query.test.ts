import { defaultSettings, evaluateTorrents } from '@lani/smart-download';
import { fetchPreviewPage } from './query';

test.each([
  ['13.000', '13', true],
  ['13', '13', true],
  [13, 13, true],
  ['13.500', '13.5', false],
  ['13x', '13x', false],
  ['', '', false],
  [null, null, false],
  [{ from: '13.000', to: '14.000' }, { from: '13.000', to: '14.000' }, false],
])('接口集号 %j 正确展示并参与整集匹配', async (index, displayed, eligible) => {
  const client = {
    query: jest.fn().mockResolvedValue({
      data: {
        allTorrents: {
          nodes: [
            {
              id: 1,
              hash: 'baha',
              title: '[Baha] Example - 13',
              publishDate: '2026-10-04T14:00:00Z',
              episodeInfo: { type: 'episode', index },
              parseVersion: 2,
              channel: 'MIKAN',
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    }),
  };
  const page = await fetchPreviewPage(
    client,
    1,
    { first: 30 },
    new AbortController().signal,
  );
  expect(page.nodes[0].episodeInfo?.index).toEqual(displayed);
  const [decision] = evaluateTorrents(
    [
      {
        id: 1,
        type: 'episode',
        number: 1,
        sort: 13,
        airTime: '2026-10-04T13:30:00Z',
      },
    ],
    page.nodes,
    defaultSettings,
    Date.parse('2026-10-05T00:00:00Z'),
  );
  expect(decision.reasons).toEqual(eligible ? [] : ['episode']);
  expect(decision.episodeId).toBe(eligible ? 1 : undefined);
});
