const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");

const hook = path.resolve(__dirname, "../../git-hooks/pre-push");
const oid = "1".repeat(40);
const zero = "0".repeat(40);
const message =
  "分支名需要遵循 Conventional Commit，禁止使用 `codex/` 作为分支名\n";
const update = (source: string, target: string, sourceOid = oid) =>
  `${source} ${sourceOid} ${target} ${zero}\n`;

const cases = [
  [
    "allows ordinary branches",
    update("refs/heads/fix/hook", "refs/heads/fix/hook"),
    0,
  ],
  [
    "blocks codex branches",
    update("refs/heads/codex/fix-hook", "refs/heads/codex/fix-hook"),
    1,
  ],
  [
    "blocks codex source with renamed target",
    update("refs/heads/codex/fix-hook", "refs/heads/fix/hook"),
    1,
  ],
  [
    "blocks codex target with HEAD source",
    update("HEAD", "refs/heads/codex/fix-hook"),
    1,
  ],
  [
    "allows deleting old codex branches",
    update("(delete)", "refs/heads/codex/old", zero),
    0,
  ],
  [
    "allows tags with codex prefix",
    update("refs/tags/codex/v1", "refs/tags/codex/v1"),
    0,
  ],
  [
    "allows codex within branch name",
    update("refs/heads/fix/codex/hook", "refs/heads/fix/codex/hook"),
    0,
  ],
  ["allows no updates", "", 0],
  [
    "checks all updates",
    update("refs/heads/next", "refs/heads/next") +
      update("refs/heads/codex/hook", "refs/heads/codex/hook"),
    1,
  ],
] as const;

for (const [name, input, status] of cases) {
  test(name, () => {
    const result = spawnSync(hook, ["origin", "unused"], {
      input,
      encoding: "utf8",
    });
    assert.ifError(result.error);
    assert.equal(result.status, status);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, status === 1 ? message : "");
  });
}
