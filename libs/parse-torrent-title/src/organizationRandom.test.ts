import { parseTorrentOrganization } from "./parseTorrentOrganization";

interface RandomOrganizationRow {
  id: string;
  title: string;
  expected_groups: string[];
  format: string;
}

const { FORMATS, generateCorpus } =
  require("../scripts/organization-random-corpus.cjs") as {
    FORMATS: string[];
    generateCorpus: (seed: string, count: number) => RandomOrganizationRow[];
  };

function canonicalGroups(groups: string[]): string[] {
  const normalized = groups.map((group) =>
    group
      .replace(/[！-～]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0xfee0)
      )
      .replace(/[\s\u3000]+/g, " ")
      .trim()
  );
  return [...new Set(normalized)].sort();
}

it("在独立随机生成的未知制作组格式上达到准确率门槛", () => {
  const seed = "organization-ci-v2";
  const rows = generateCorpus(seed, 10000);
  const scores = new Map(
    FORMATS.map((format) => [format, { total: 0, correct: 0 }])
  );
  let correct = 0;
  let jointTotal = 0;
  let jointCorrect = 0;
  let negativeTotal = 0;
  const falsePositives: unknown[] = [];
  const failures: unknown[] = [];
  for (const row of rows) {
    const actual = canonicalGroups(
      parseTorrentOrganization(row.title)?.parts || []
    );
    const expected = canonicalGroups(row.expected_groups);
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    const score = scores.get(row.format)!;
    score.total += 1;
    score.correct += Number(passed);
    correct += Number(passed);
    if (expected.length > 1) {
      jointTotal += 1;
      jointCorrect += Number(passed);
    }
    if (!expected.length) {
      negativeTotal += 1;
      if (actual.length) falsePositives.push({ ...row, actual });
    }
    if (!passed && failures.length < 20) failures.push({ ...row, actual });
  }
  console.info(
    JSON.stringify({
      seed,
      count: rows.length,
      correct,
      accuracy: correct / rows.length,
      jointTotal,
      jointAccuracy: jointCorrect / jointTotal,
      negativeTotal,
      falsePositiveCount: falsePositives.length,
      formats: Object.fromEntries(
        [...scores].map(([format, score]) => [
          format,
          { ...score, accuracy: score.correct / score.total },
        ])
      ),
      failures,
    })
  );
  expect(rows).toHaveLength(10000);
  expect(scores.size).toBe(FORMATS.length);
  for (const score of scores.values()) {
    expect(score.total).toBeGreaterThanOrEqual(
      Math.floor(rows.length / FORMATS.length)
    );
    expect(score.total).toBeLessThanOrEqual(
      Math.ceil(rows.length / FORMATS.length)
    );
  }
  expect(jointTotal).toBeGreaterThanOrEqual(
    8 * Math.floor(rows.length / FORMATS.length)
  );
  expect(negativeTotal).toBeGreaterThanOrEqual(
    8 * Math.floor(rows.length / FORMATS.length)
  );
  expect(correct / rows.length).toBeGreaterThanOrEqual(0.95);
  expect(jointCorrect / jointTotal).toBeGreaterThanOrEqual(0.95);
  expect(falsePositives.slice(0, 20)).toEqual([]);
});

it("随机语料可以用固定seed完整重放，并覆盖所有固定格式", () => {
  const rows = generateCorpus(
    "organization-design-replay",
    FORMATS.length * 10
  );
  expect(
    generateCorpus("organization-design-replay", FORMATS.length * 10)
  ).toEqual(rows);
  expect(
    generateCorpus("organization-other-seed", FORMATS.length * 10)
  ).not.toEqual(rows);
  expect([...new Set(rows.map((row) => row.format))].sort()).toEqual(
    [...FORMATS].sort()
  );
  for (const row of rows) {
    expect(new Set(row.expected_groups).size).toBe(row.expected_groups.length);
    for (const group of row.expected_groups) expect(row.title).toContain(group);
  }
});
