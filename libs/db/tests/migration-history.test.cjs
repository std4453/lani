const test = require("node:test");
const assert = require("node:assert/strict");
const { compareHistory } = require("../scripts/migration-history.cjs");
const migrations = [1, 2, 3].map((id) => ({
  name: `2026100300000${id}_example`,
  checksum: String(id).repeat(64),
}));
const row = (index, extra = {}) => ({
  id: `id-${index}`,
  migration_name: migrations[index].name,
  checksum: migrations[index].checksum,
  started_at: "2026-10-03T00:00:00.000Z",
  finished_at: "2026-10-03T00:00:01.000Z",
  rolled_back_at: null,
  ...extra,
});
test("the same release files detect a restored/lagging database even without a Git diff", () => {
  const behind = compareHistory(migrations, [row(0)]);
  const current = compareHistory(migrations, [row(0), row(1), row(2)]);
  assert.equal(behind.status, "pending");
  assert.deepEqual(
    behind.pending,
    migrations.slice(1).map((migration) => migration.name)
  );
  assert.equal(current.status, "current");
  assert.equal(current.sourceHash, behind.sourceHash);
  assert.notEqual(current.historyHash, behind.historyHash);
});
test("failed/active migrations, duplicate success, missing/modified history and gaps block publication", () => {
  for (const rows of [
    [],
    [row(0, { finished_at: null })],
    [row(0), row(0)],
    [row(0, { checksum: "changed" })],
    [row(0), row(2)],
    [row(0, { migration_name: "unknown" })],
    [row(0, { rolled_back_at: "now" })],
  ]) {
    assert.throws(() => compareHistory(migrations, rows));
  }
});
test("explicitly resolved rolled-back attempts do not count as applied", () => {
  const result = compareHistory(migrations, [
    row(0),
    row(1, { finished_at: null, rolled_back_at: "2026-10-03T00:00:02.000Z" }),
  ]);
  assert.equal(result.status, "pending");
  assert.equal(result.pending.length, 2);
});
test("business records never participate in migration classification", () => {
  const records = [row(0), row(1), row(2)];
  const before = compareHistory(migrations, records);
  const after = compareHistory(
    migrations,
    records.map((record) => ({
      ...record,
      unrelatedBusinessData: Math.random(),
    }))
  );
  assert.deepEqual(after, before);
});
