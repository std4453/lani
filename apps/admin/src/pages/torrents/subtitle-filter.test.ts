import { subtitleFilter } from './subtitle-filter';

it('matches all Chinese variants in parsed titles and recognized page metadata', () => {
  const branches = subtitleFilter(['zh'])!.or!;
  for (const language of ['zh', 'zh-Hans', 'zh-Hant']) {
    expect(branches).toContainEqual({
      parseVersion: { isNull: false },
      parseResult: { contains: { subtitleInfo: { languages: [language] } } },
    });
    expect(branches).toContainEqual({
      metadata: {
        contains: { status: 'known', subtitleInfo: { languages: [language] } },
      },
    });
  }
  expect(branches).toHaveLength(8);
  for (const field of ['subtitleHasChs', 'subtitleHasCht']) {
    expect(branches).toContainEqual({
      parseVersion: { isNull: true },
      [field]: { equalTo: true },
    });
  }
});

it('unions Japanese and English without allowing stale legacy flags on reparsed rows', () => {
  expect(subtitleFilter(['ja', 'en'])?.or).toEqual([
    {
      parseVersion: { isNull: false },
      parseResult: { contains: { subtitleInfo: { languages: ['ja'] } } },
    },
    {
      metadata: {
        contains: { status: 'known', subtitleInfo: { languages: ['ja'] } },
      },
    },
    { parseVersion: { isNull: true }, subtitleHasJp: { equalTo: true } },
    {
      parseVersion: { isNull: false },
      parseResult: { contains: { subtitleInfo: { languages: ['en'] } } },
    },
    {
      metadata: {
        contains: { status: 'known', subtitleInfo: { languages: ['en'] } },
      },
    },
  ]);
});

it('ignores unknown values and repeated selections', () => {
  expect(subtitleFilter(['zh', 'invalid', 'zh', '__proto__'])).toEqual(
    subtitleFilter(['zh']),
  );
});
