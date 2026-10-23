const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { calculate, snapshot } = require("./build-fingerprints.cjs");

const ref = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const tree = snapshot(ref);
const baseline = calculate(tree).manifest;

function withChange(file, content) {
  const entries = new Map(tree.entries);
  if (content === null) entries.delete(file);
  else
    entries.set(file, {
      mode: "100644",
      oid: createHash("sha1").update(content).digest("hex"),
    });
  return calculate({
    entries,
    read: (name) => (name === file ? content : tree.read(name)),
  }).manifest;
}

for (const file of ["docs/docs/intro.md", ".github/workflows/docs.yaml"]) {
  test(`${file} changes do not invalidate any application fingerprint`, () => {
    assert.deepEqual(withChange(file, "Updated docs input\n"), baseline);
    assert.deepEqual(withChange(file, null), baseline);
  });
}

test("docs package script changes do not invalidate applications", () => {
  const pkg = JSON.parse(tree.read("docs/package.json"));
  pkg.scripts.build = "docusaurus build --no-minify";
  assert.deepEqual(
    withChange("docs/package.json", JSON.stringify(pkg)),
    baseline
  );
});

test("adding docs resources does not invalidate applications", () => {
  assert.deepEqual(
    withChange("docs/static/new-image.svg", "<svg/>\n"),
    baseline
  );
});

test("application source changes still invalidate the owning application", () => {
  const changed = withChange(
    "apps/admin/src/fingerprint-test.ts",
    "export {};\n"
  );
  const affected = Object.keys(baseline.images).filter(
    (app) =>
      baseline.images[app].fingerprint !== changed.images[app].fingerprint
  );
  assert.deepEqual(affected, ["admin"]);
});

test("application build workflows remain shared fingerprint inputs", () => {
  const changed = withChange(
    ".github/workflows/build_generic.yaml",
    "name: Updated application build\n"
  );
  for (const app of Object.keys(baseline.images))
    assert.notEqual(
      changed.images[app].fingerprint,
      baseline.images[app].fingerprint
    );
});
