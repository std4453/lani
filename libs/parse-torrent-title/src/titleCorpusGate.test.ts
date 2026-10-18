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
import { createHash } from "crypto";

const gateTitle = (id: number) =>
  `[Group] 蓝色行星 / Blue Planet - 01 fixture ${id}`;

interface Exclusion {
  id: number | string;
  title: string;
  reason?: unknown;
}

function runGate(
  actual: string[],
  expected: string[],
  options: {
    status?: string;
    currentIndex?: number;
    baselineCount?: number;
    sampleIds?: number[];
    expectedById?: Record<number, string[]>;
    exclusions?: Exclusion[];
    throwOnFirst?: boolean;
  } = {}
) {
  const directory = mkdtempSync(join(tmpdir(), "title-names-gate-"));
  try {
    mkdirSync(join(directory, "scripts"));
    mkdirSync(join(directory, "dist"));
    cpSync(
      join(__dirname, "../scripts/check-title-corpus.cjs"),
      join(directory, "scripts/check-title-corpus.cjs")
    );
    writeFileSync(
      join(directory, "dist/index.js"),
      `exports.default = (input) => {
        const first = input === ${JSON.stringify(gateTitle(1))};
        if (first && ${Boolean(
          options.throwOnFirst
        )}) throw new Error("Fixture error");
        return {
          index: first ? ${options.currentIndex ?? 1} : 1,
          title: { aliases: ${JSON.stringify(actual)} }
        };
      };`
    );
    writeFileSync(
      join(directory, "baseline.ndjson"),
      Array.from({ length: options.baselineCount ?? 1 }, (_, index) =>
        JSON.stringify({
          id: index + 1,
          title: gateTitle(index + 1),
          parsed: { index: 1 },
        })
      ).join("\n")
    );
    writeFileSync(
      join(directory, "labels.ndjson"),
      (options.sampleIds ?? [1])
        .map((id) =>
          JSON.stringify({
            id,
            title: gateTitle(id),
            status: options.status ?? "ready",
            expected_titles: options.expectedById?.[id] ?? expected,
          })
        )
        .join("\n")
    );
    if (options.exclusions !== undefined)
      writeFileSync(
        join(directory, "exclusions.ndjson"),
        options.exclusions.map((row) => JSON.stringify(row)).join("\n")
      );
    const result = spawnSync(
      process.execPath,
      [
        join(directory, "scripts/check-title-corpus.cjs"),
        join(directory, "baseline.ndjson"),
        join(directory, "labels.ndjson"),
        join(directory, "report.json"),
        ...(options.exclusions === undefined
          ? []
          : [join(directory, "exclusions.ndjson")]),
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

describe("标题语料严格验收", () => {
  const names = ["蓝色行星", "Blue Planet"];
  test("完整别名集合与旧非标题字段一致才通过", () => {
    expect(runGate([...names].reverse(), names).status).toBe(0);
  });
  test.each([
    [["蓝色行星"], names],
    [[...names, "1080p"], names],
    [["蓝色行", "Blue Planet"], names],
  ])("拒绝遗漏、误提取与截断", (actual, expected) => {
    expect(runGate(actual, expected).status).toBe(1);
  });
  test("未定标签留在分母，不能用于提高通过率", () => {
    const result = runGate(names, names, { status: "pending" });
    expect(result.status).toBe(1);
    expect(result.report.summary).toMatchObject({
      sample: 1,
      correct: 0,
      excluded: 0,
    });
  });
  test("标题正确也不能掩盖剧集结果变化", () => {
    const result = runGate(names, names, { currentIndex: 2 });
    expect(result.status).toBe(1);
    expect(result.report.summary.invariantChanges).toBe(1);
  });

  const exclusion = {
    id: 1,
    title: gateTitle(1),
    reason: "已独立审核的特殊标题",
  };

  test.each([
    [{ id: 1, title: gateTitle(1) }],
    [{ ...exclusion, reason: "  " }],
    [{ ...exclusion, reason: 42 }],
    [{ ...exclusion, id: 51 }],
    [{ ...exclusion, id: "1" }],
    [{ ...exclusion, title: "不匹配的原文" }],
    [exclusion, exclusion],
  ])("拒绝缺理由、未知、原文不匹配或重复的例外：%j", (...exclusions) => {
    const result = runGate(names, names, { baselineCount: 50, exclusions });
    expect(result.status).toBe(1);
    expect(result.error).toMatch(/exclusion|duplicate row/i);
  });

  test("按全库数量校验2%上限", () => {
    const result = runGate(names, names, {
      baselineCount: 49,
      exclusions: [exclusion],
    });
    expect(result.status).toBe(1);
    expect(result.error).toContain("exceed 2%");
  });

  test("合规名单仅扣除命中样本并保存哈希和审核依据", () => {
    const unsampled = { ...exclusion, id: 100, title: gateTitle(100) };
    const exclusions = [exclusion, unsampled];
    const result = runGate(names, names, {
      baselineCount: 100,
      sampleIds: [1, 2, 3],
      expectedById: { 1: ["这是被排除项的错误标题"] },
      exclusions,
    });
    expect(result.status).toBe(0);
    expect(result.report.summary).toMatchObject({
      population: 100,
      eligiblePopulation: 98,
      sample: 3,
      evaluatedSample: 2,
      excludedPopulation: 2,
      excludedSample: 1,
      excluded: 1,
      correct: 2,
      accuracy: 1,
      invariantChanges: 0,
      exceptions: 0,
    });
    expect(result.report.summary.exclusionsHash).toBe(
      createHash("sha256")
        .update(exclusions.map((row) => JSON.stringify(row)).join("\n"))
        .digest("hex")
    );
    expect(result.report.exclusions).toEqual(exclusions);
    expect(result.report.failures).toEqual([]);
  });

  test.each(["pending", "out_of_domain"])("名单外的%s仍计失败", (status) => {
    const result = runGate(names, names, {
      baselineCount: 50,
      sampleIds: [1, 2],
      status,
      exclusions: [exclusion],
    });
    expect(result.status).toBe(1);
    expect(result.report.summary).toMatchObject({
      evaluatedSample: 1,
      correct: 0,
      accuracy: 0,
    });
    expect(result.report.failures.map((row: { id: number }) => row.id)).toEqual(
      [2]
    );
  });

  test("被排除条目的剧集变化仍失败", () => {
    const result = runGate(names, names, {
      baselineCount: 50,
      sampleIds: [2],
      currentIndex: 2,
      exclusions: [exclusion],
    });
    expect(result.status).toBe(1);
    expect(result.report.invariantChanges).toEqual([1]);
    expect(result.report.summary.accuracy).toBe(1);
  });

  test("被排除条目的异常仍失败", () => {
    const result = runGate(names, names, {
      baselineCount: 50,
      sampleIds: [2],
      throwOnFirst: true,
      exclusions: [exclusion],
    });
    expect(result.status).toBe(1);
    expect(result.report.exceptions).toEqual([
      { id: 1, error: "Error: Fixture error" },
    ]);
  });

  test("拒绝空评估样本", () => {
    const result = runGate(names, names, {
      baselineCount: 50,
      exclusions: [exclusion],
    });
    expect(result.status).toBe(1);
    expect(result.report.summary).toMatchObject({
      evaluatedSample: 0,
      accuracy: null,
      wilson95: null,
    });
  });
});
