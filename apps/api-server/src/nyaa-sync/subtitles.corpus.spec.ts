import { readFileSync } from 'fs';
import { join } from 'path';
import { extractNyaaMetadata, parseNyaaSubtitles } from './subtitles';

type Sample = {
  id: string;
  html: string;
  languages: string[];
  status: 'known' | 'none' | 'unknown';
  split: 'development' | 'holdout';
};
const corpus: Sample[] = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/subtitles/corpus.json'), 'utf8'),
);

// 语料的期望值由独立标注提供，不能使用解析器输出反向更新。
describe('Nyaa public-page corpus', () => {
  it.each(['development', 'holdout'] as const)(
    'measures %s language accuracy',
    (split) => {
      const samples = corpus.filter((sample) => sample.split === split);
      let tp = 0,
        fp = 0,
        fn = 0,
        exact = 0;
      const misses: Array<{
        id: string;
        expected: string[];
        actual: string[];
        status: string;
      }> = [];
      for (const sample of samples) {
        const hash = 'a'.repeat(40);
        const metadata = extractNyaaMetadata(
          `${sample.html}<a href="magnet:?xt=urn:btih:${hash}"></a>`,
          hash,
        );
        const actual = parseNyaaSubtitles(metadata);
        const predicted = actual.subtitleInfo?.languages ?? [];
        const expected = [...new Set(sample.languages)].sort();
        tp += predicted.filter((language) =>
          expected.includes(language),
        ).length;
        fp += predicted.filter(
          (language) => !expected.includes(language),
        ).length;
        fn += expected.filter(
          (language) => !predicted.includes(language),
        ).length;
        if (
          JSON.stringify(predicted) === JSON.stringify(expected) &&
          actual.status === sample.status
        )
          exact++;
        else
          misses.push({
            id: sample.id,
            expected,
            actual: predicted,
            status: actual.status,
          });
      }
      const precision = tp / (tp + fp || 1);
      const recall = tp / (tp + fn || 1);
      const exactMatch = exact / samples.length;
      console.info(
        JSON.stringify({
          split,
          samples: samples.length,
          tp,
          fp,
          fn,
          precision,
          recall,
          exactMatch,
          misses,
        }),
      );
      expect(samples.length).toBeGreaterThanOrEqual(5);
      expect(precision).toBeGreaterThanOrEqual(0.98);
      expect(recall).toBeGreaterThanOrEqual(0.9);
      expect(exactMatch).toBeGreaterThanOrEqual(0.85);
    },
  );
});
