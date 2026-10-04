const assert = require("node:assert/strict");
const test = require("node:test");
const { releaseApplications, releaseInputs } = require("../dist/utils/release");
const {
  select,
  assemble,
} = require("../../../.github/scripts/release-plan.cjs");
const revision = "a".repeat(40);
const result = (app) => ({
  project: `@lani/${app}`,
  revision,
  image: `example.invalid/${app}@sha256:${"b".repeat(64)}`,
});
test("CLI and workflow selections accept single/multi app releases and reject ambiguity", () => {
  for (const input of [
    "api-server",
    "@lani/admin",
    "gateway,api-server,data-server",
  ])
    assert.deepEqual(releaseApplications(input), select(input, ""));
  assert.deepEqual(select("", "@lani/api-server"), ["api-server"]);
  for (const input of ["", "db", "api-server,api-server", "admin,"]) {
    assert.throws(() => releaseApplications(input));
    assert.throws(() => select(input, ""));
  }
  assert.throws(() => select("admin", "@lani/admin"));
  assert.deepEqual(
    releaseInputs(revision, ["gateway", "api-server"], "offline"),
    { ref: revision, apps: "api-server,gateway", environment: "offline" }
  );
});
test("release assembly requires all immutable artifacts at one commit and exactly one db result", () => {
  const apps = ["api-server", "data-server"];
  const results = [...apps, "db"].map(result);
  const plan = assemble(apps, revision, results);
  assert.equal(Object.keys(plan.applications).length, 2);
  assert.equal(plan.migration.image, result("db").image);
  assert.throws(() => assemble(apps, revision, results.slice(0, 2)));
  assert.throws(() => assemble(apps, revision, [...results, result("db")]));
  assert.throws(() =>
    assemble(apps, revision, [
      ...results.slice(0, 2),
      { ...result("db"), revision: "c".repeat(40) },
    ])
  );
  assert.throws(() =>
    assemble(apps, revision, [
      ...results.slice(0, 2),
      { ...result("db"), image: "example.invalid/db:latest" },
    ])
  );
  assert.equal(
    assemble(["admin"], revision, [result("admin")]).migration,
    undefined
  );
  assert.throws(() =>
    assemble(["admin"], revision, [result("admin"), result("db")])
  );
});

test("every backend selection requires one db artifact, including Gateway-only releases", () => {
  for (const apps of [
    ["gateway"],
    ["api-server"],
    ["data-server"],
    ["admin", "gateway"],
  ]) {
    const artifacts = apps.map(result);
    assert.throws(() => assemble(apps, revision, artifacts));
    const plan = assemble(apps, revision, [...artifacts, result("db")]);
    assert.deepEqual(plan.migration, { image: result("db").image, revision });
    assert.deepEqual(Object.keys(plan.applications), apps);
  }
});
