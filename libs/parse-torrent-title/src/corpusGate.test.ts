import { spawnSync } from "child_process";
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const title = "Fixture Show - 01 [1080p]";
const id = 1;

interface GateFixture {
  baselineIndex: number | null;
  currentIndex: number | null;
  labels: Array<{
    id: number;
    title: string;
    index: number | null;
    reason: string;
  }>;
}

function runGate(fixture: GateFixture) {
  const directory = mkdtempSync(join(tmpdir(), "parse-title-corpus-gate-"));
  const scriptsDirectory = join(directory, "scripts");
  const distDirectory = join(directory, "dist");
  mkdirSync(scriptsDirectory, { recursive: true });
  mkdirSync(distDirectory, { recursive: true });
  cpSync(
    join(__dirname, "../scripts/check-corpus.cjs"),
    join(scriptsDirectory, "check-corpus.cjs")
  );

  writeFileSync(
    join(distDirectory, "index.js"),
    `exports.default = () => ({ index: ${JSON.stringify(
      fixture.currentIndex
    )} });\n`
  );

  const baselinePath = join(directory, "baseline.ndjson");
  const eligibilityPath = join(directory, "eligibility.ndjson");
  const reviewsPath = join(directory, "reviews.ndjson");
  const labelsPath = join(directory, "expected-indices.ndjson");
  writeFileSync(
    baselinePath,
    `${JSON.stringify({
      id,
      title,
      parsed: { index: fixture.baselineIndex },
    })}\n`
  );
  writeFileSync(
    eligibilityPath,
    `${JSON.stringify({ id, title, eligible: true })}\n`
  );
  writeFileSync(reviewsPath, "");
  writeFileSync(
    labelsPath,
    fixture.labels.map((label) => JSON.stringify(label)).join("\n") + "\n"
  );

  const result = spawnSync(
    process.execPath,
    [
      join(scriptsDirectory, "check-corpus.cjs"),
      baselinePath,
      eligibilityPath,
      reviewsPath,
      labelsPath,
    ],
    { encoding: "utf8" }
  );
  return { directory, result };
}

function label(overrides: Partial<GateFixture["labels"][number]> = {}) {
  return {
    id,
    title,
    index: 1,
    reason: "Fixture label from an independent expected value.",
    ...overrides,
  };
}

describe("corpus gate expected-index labels", () => {
  it("detects an unchanged successful index that disagrees with its gold label", () => {
    const { directory, result } = runGate({
      baselineIndex: 2,
      currentIndex: 2,
      labels: [label()],
    });

    try {
      expect(result.status).toBe(1);
      const report = JSON.parse(result.stdout);
      expect(report.index_validation).toMatchObject({
        labeled_rows: 1,
        wrong_successful_indices: 1,
        missed_indices: 0,
      });
      expect(report.index_validation.errors).toEqual([
        {
          id,
          expected: 1,
          actual: 2,
          kind: "wrong_successful_index",
        },
      ]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("passes when the successful index matches its gold label", () => {
    const { directory, result } = runGate({
      baselineIndex: 1,
      currentIndex: 1,
      labels: [label()],
    });

    try {
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout).index_validation).toMatchObject({
        labeled_rows: 1,
        wrong_successful_indices: 0,
        missed_indices: 0,
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    [
      "unknown ids",
      [label({ id: 2, title: "Unknown title" })],
      /title\/id mismatch/,
    ],
    [
      "title mismatches",
      [label({ title: "A different title" })],
      /title\/id mismatch/,
    ],
    ["duplicate labels", [label(), label()], /duplicate id 1/],
  ])("rejects %s", (_description, labels, message) => {
    const { directory, result } = runGate({
      baselineIndex: 1,
      currentIndex: 1,
      labels: labels as GateFixture["labels"],
    });

    try {
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(message as RegExp);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects a successful parse when the expected index is null", () => {
    const { directory, result } = runGate({
      baselineIndex: 1,
      currentIndex: 1,
      labels: [
        label({ index: null, reason: "This title has no episode index." }),
      ],
    });

    try {
      expect(result.status).toBe(1);
      expect(JSON.parse(result.stdout).index_validation.errors).toEqual([
        {
          id,
          expected: null,
          actual: 1,
          kind: "wrong_successful_index",
        },
      ]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
