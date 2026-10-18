import { spawnSync } from "child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { gzipSync } from "zlib";

const namesTitle = {
  raw: "蓝色行星",
  aliases: ["蓝色行星"],
  positionalItems: [],
};
const parsed = {
  title: namesTitle,
  raw: "resource",
  index: 1,
  episodeInfo: { type: "episode", index: 1 },
  subtitle: "CHS",
  subtitleInfo: { languages: ["zh-Hans"] },
  source: "WEB",
  format: "MKV",
  positionalItems: ["opaque"],
};
const org = (parts: string[]) =>
  parts.length ? { raw: parts.join("&"), parts } : undefined;
type Row = Record<string, unknown>;
interface Options {
  count?: number;
  failures?: number;
  actual?: string[];
  expected?: string[];
  status?: string;
  fallback?: boolean;
  currentParsed?: Row | null;
  currentTitle?: Row;
  direct?: unknown;
  organization?: unknown;
  baselinePatch?: Row;
  labelPatch?: Row;
  duplicateBaseline?: boolean;
  duplicateLabel?: boolean;
  emptyLabels?: boolean;
  extraArgs?: string[];
  throwOnFirst?: boolean;
  gzip?: boolean;
  sampleIds?: number[];
}
function runGate(options: Options = {}) {
  const directory = mkdtempSync(join(tmpdir(), "organization-gate-"));
  try {
    mkdirSync(join(directory, "scripts"));
    mkdirSync(join(directory, "dist"));
    cpSync(
      join(__dirname, "../scripts/check-organization-corpus.cjs"),
      join(directory, "scripts/check-organization-corpus.cjs")
    );
    const actual = options.actual ?? ["Alpha", "Beta"];
    const organization = Object.prototype.hasOwnProperty.call(
      options,
      "organization"
    )
      ? options.organization
      : org(actual);
    const direct = Object.prototype.hasOwnProperty.call(options, "direct")
      ? options.direct
      : organization;
    const currentParsed = options.fallback
      ? null
      : options.currentParsed ?? parsed;
    writeFileSync(
      join(directory, "dist/index.js"),
      `
      const organization = ${JSON.stringify(organization) ?? "undefined"};
      const check = (input) => { if (${Boolean(
        options.throwOnFirst
      )} && input === 'Fixture 1') throw new Error('Fixture error'); };
      exports.default = (input) => { check(input); const parsed = ${JSON.stringify(
        currentParsed
      )}; return parsed ? { ...parsed, organization } : undefined; };
      exports.parseTorrentNames = (input) => { check(input); return { title: ${JSON.stringify(
        options.currentTitle ?? namesTitle
      )}, organization }; };
      exports.parseTorrentOrganization = () => (${
        JSON.stringify(direct) ?? "undefined"
      });
    `
    );
    const baseline: Row[] = Array.from(
      { length: options.count ?? 1 },
      (_, index) => ({
        id: index + 1,
        title: `Fixture ${index + 1}`,
        parsed: options.fallback ? null : parsed,
        names: { title: namesTitle },
        ...(index === 0 ? options.baselinePatch : {}),
      })
    );
    const labels: Row[] = options.emptyLabels
      ? []
      : baseline
          .filter(
            (row) =>
              !options.sampleIds || options.sampleIds.includes(row.id as number)
          )
          .map((row, index) => ({
            id: row.id,
            title: row.title,
            status: options.status ?? "ready",
            expected_groups:
              index < (options.failures ?? 0)
                ? ["Wrong"]
                : options.expected ?? actual,
            ...(index === 0 ? options.labelPatch : {}),
          }));
    if (options.duplicateBaseline) baseline.push(baseline[0]);
    if (options.duplicateLabel) labels.push(labels[0]);
    const baselineBytes = Buffer.from(
      baseline.map((row) => JSON.stringify(row)).join("\n")
    );
    const baselinePath = join(
      directory,
      options.gzip ? "baseline.ndjson.gz" : "baseline.ndjson"
    );
    writeFileSync(
      baselinePath,
      options.gzip ? gzipSync(baselineBytes) : baselineBytes
    );
    writeFileSync(
      join(directory, "labels.ndjson"),
      labels.map((row) => JSON.stringify(row)).join("\n")
    );
    const result = spawnSync(
      process.execPath,
      [
        join(directory, "scripts/check-organization-corpus.cjs"),
        baselinePath,
        join(directory, "labels.ndjson"),
        join(directory, "report.json"),
        ...(options.extraArgs ?? []),
      ],
      { encoding: "utf8" }
    );
    return {
      status: result.status,
      error: result.stderr,
      report: existsSync(join(directory, "report.json"))
        ? JSON.parse(readFileSync(join(directory, "report.json"), "utf8"))
        : undefined,
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("制作组语料严格验收", () => {
  test("完整集合忽略顺序及空白和全角ASCII，保存全量指标和哈希", () => {
    const result = runGate({
      actual: ["Ａlpha", "Beta  Subs"],
      expected: ["Beta Subs", "Alpha"],
      gzip: true,
    });
    expect(result.status).toBe(0);
    expect(result.report.summary).toMatchObject({
      population: 1,
      sample: 1,
      correct: 1,
      accuracy: 1,
      excluded: 0,
      invariantChanges: 0,
      exceptions: 0,
      subsets: { jointGroups: { sample: 1, correct: 1 } },
    });
    for (const field of ["baselineHash", "labelsHash", "checkerHash"])
      expect(result.report.summary[field]).toMatch(/^[a-f0-9]{64}$/);
    expect(result.report.summary.distHashes["index.js"]).toMatch(
      /^[a-f0-9]{64}$/
    );
    expect(result.report.summary.wilson95).toHaveLength(2);
  });
  test("恰好99%通过，98%失败，明细保留全部错误", () => {
    expect(runGate({ count: 100, failures: 1 }).status).toBe(0);
    const result = runGate({ count: 100, failures: 2 });
    expect(result.status).toBe(1);
    expect(result.report.failures).toHaveLength(2);
    expect(result.report.summary.sample).toBe(100);
  });
  test.each([
    { actual: ["Alpha"], expected: ["Alpha", "Beta"] },
    { actual: ["Alpha&Beta"], expected: ["Alpha", "Beta"] },
    { actual: ["Alpha"], expected: [] },
    { actual: ["alpha"], expected: ["Alpha"] },
    { actual: ["Alpha-Subs"], expected: ["Alpha.Subs"] },
  ])("漏联合、错误拆分、无组误提及拼写变化均失败：%j", (options) => {
    expect(runGate(options).status).toBe(1);
  });
  test("无组须为undefined，空集合正确计入无组子集", () => {
    const result = runGate({ actual: [] });
    expect(result.status).toBe(0);
    expect(result.report.summary.subsets.withoutGroups).toMatchObject({
      sample: 1,
      correct: 1,
    });
  });
  test("旧default失败时，fallback署名仍被评估", () => {
    expect(runGate({ fallback: true }).status).toBe(0);
    expect(
      runGate({ fallback: true, actual: [], expected: ["Alpha"] }).status
    ).toBe(1);
  });
  test.each([
    { ...parsed, title: { ...namesTitle, raw: "改变标题" } },
    { ...parsed, episodeInfo: { type: "episode", index: 2 } },
    { ...parsed, subtitleInfo: { languages: ["zh-Hant"] } },
    { ...parsed, subtitle: "CHT" },
    { ...parsed, source: "BD" },
    { ...parsed, format: "MP4" },
    { ...parsed, positionalItems: [] },
    { ...parsed, futureField: "不能偷偷新增" },
  ])("非组织字段任何变化都失败：%j", (currentParsed) => {
    const result = runGate({ currentParsed });
    expect(result.status).toBe(1);
    expect(result.report.invariantChanges[0].changes[0].field).toBe(
      "default except organization"
    );
  });
  test("完整解析成功状态不得改变", () => {
    expect(runGate({ baselinePatch: { parsed: null } }).status).toBe(1);
    expect(runGate({ fallback: true, baselinePatch: { parsed } }).status).toBe(
      1
    );
  });
  test("独立names.title即使default成功也受保护，fallback时同样受保护", () => {
    for (const fallback of [false, true]) {
      const result = runGate({
        fallback,
        currentTitle: { ...namesTitle, aliases: ["Changed"] },
      });
      expect(result.status).toBe(1);
      expect(
        result.report.invariantChanges[0].changes.some(
          (change: Row) => change.field === "parseTorrentNames.title"
        )
      ).toBe(true);
    }
  });
  test("未定样本计失败且不能减少分母", () => {
    const result = runGate({ status: "pending" });
    expect(result.status).toBe(1);
    expect(result.report.summary).toMatchObject({
      sample: 1,
      correct: 0,
      statuses: { pending: 1 },
    });
  });
  test.each([
    null,
    { raw: "", parts: ["Alpha"] },
    { raw: "Alpha", parts: [] },
    { raw: "Alpha", parts: [""] },
    { raw: "Alpha", parts: ["Alpha", "Alpha"] },
  ])("拒绝非法组织结果：%j", (organization) => {
    const result = runGate({ organization });
    expect(result.status).toBe(1);
    expect(result.report.summary.organizationErrors).toBe(1);
  });
  test("入口组织与独立组织识别器必须一致", () => {
    expect(runGate({ direct: org(["Other"]) }).status).toBe(1);
  });
  test("全库未标注条目的异常同样导致失败", () => {
    const result = runGate({ count: 2, sampleIds: [2], throwOnFirst: true });
    expect(result.status).toBe(1);
    expect(result.report.exceptions[0].error).toContain("Fixture error");
    expect(result.report.summary).toMatchObject({
      population: 2,
      sample: 1,
      correct: 1,
    });
  });
  test("未抽中样本的保护字段变化仍失败", () => {
    const result = runGate({
      count: 2,
      sampleIds: [2],
      baselinePatch: { parsed: { ...parsed, index: 9 } },
    });
    expect(result.status).toBe(1);
    expect(result.report.invariantChanges.map((row: Row) => row.id)).toEqual([
      1,
    ]);
    expect(result.report.summary.accuracy).toBe(1);
  });
  test.each<Options>([
    { extraArgs: ["exclusions.ndjson"] },
    { labelPatch: { excluded: false } },
    { baselinePatch: { in_scope: true } },
    { labelPatch: { note: { excluded_reason: "none" } } },
    { duplicateBaseline: true },
    { duplicateLabel: true },
    { labelPatch: { id: "1" } },
    { labelPatch: { id: 2 } },
    { labelPatch: { title: "Wrong original" } },
    { status: "out_of_domain" },
    { labelPatch: { expected_groups: null } },
    { labelPatch: { expected_groups: [""] } },
    { labelPatch: { expected_groups: ["Alpha", "Ａlpha"] } },
    { labelPatch: { expected_groups: [7] } },
    { baselinePatch: { names: null } },
    { baselinePatch: { id: false } },
    { emptyLabels: true },
  ])("拒绝排除参数、字段和非法输入：%j", (options) => {
    expect(runGate(options).status).toBe(1);
  });
});
