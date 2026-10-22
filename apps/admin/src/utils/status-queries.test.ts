import {
  ListSeasonCardsDocument,
  ListSeasonsDocument,
  GetSeasonByIdDocument,
  GetEpisodesStatusDocument,
  GetSeasonsStatusDocument,
  GetTaskSummariesDocument,
  GetEpisodeByIdDocument,
} from '@/generated/types';

test.each([
  ['卡片', ListSeasonCardsDocument],
  ['元数据列表', ListSeasonsDocument],
  ['季度剧集列表', GetSeasonByIdDocument],
  ['剧集轮询', GetEpisodesStatusDocument],
  ['季度轮询', GetSeasonsStatusDocument],
  ['活跃任务轮询', GetTaskSummariesDocument],
])('%s 只查询结构化流程摘要', (_, document) => {
  const query = JSON.stringify(document);
  expect(query).toContain('"value":"taskSummaryFields"');
  expect(query).toContain('"value":"currentStepId"');
  expect(query).toContain('"value":"steps"');
  for (const name of [
    'checkpoint',
    'failedReason',
    'batchEntries',
    'sourcePath',
    'filePath',
    'importPath',
    'taskDetailsFields',
    'taskStatusFields',
  ]) {
    expect(query).not.toContain(`"value":"${name}"`);
  }
});

test('详情弹框仍加载完整任务字段', () => {
  const query = JSON.stringify(GetEpisodeByIdDocument);
  expect(query).toContain('"value":"taskDetailsFields"');
  expect(query).toContain('"value":"failedReason"');
  expect(query).toContain('"value":"workflow"');
});
