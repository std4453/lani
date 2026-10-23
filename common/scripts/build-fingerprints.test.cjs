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
  return withChanges([[file, content]]);
}

function withChanges(changes) {
  const entries = new Map(tree.entries);
  const contents = new Map(changes);
  for (const [file, content] of contents) {
    if (content === null) entries.delete(file);
    else
      entries.set(file, {
        mode: "100644",
        oid: createHash("sha1").update(content).digest("hex"),
      });
  }
  return calculate({
    entries,
    read: (name) => (contents.has(name) ? contents.get(name) : tree.read(name)),
  }).manifest;
}

for (const file of [
  "docs/docs/intro.md",
  ".github/workflows/docs.yaml",
  "README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "development/ci-cd.md",
  "development/local-development.md",
  "common/scripts/BUILD_MANIFEST.md",
  "apps/gateway/README.md",
  "apps/gateway/AGENTS.md",
  "apps/gateway/DESIGN.md",
  "libs/db/AGENTS.md",
  "libs/anime-matcher/PROTOCOL.md",
  "apps/admin/docs/screenshots/theme-desktop-light.png",
]) {
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
  for (const file of [
    "docs/static/new-image.svg",
    "apps/api-server/docs/images/new-screenshot.png",
    "libs/workflow/docs/new-diagram.svg",
    "development/images/new-diagram.svg",
    "notes/new-guide.md",
    "libs/workflow/new-guide.MDX",
    "apps/admin/new-guide.markdown",
  ])
    assert.deepEqual(withChange(file, "New documentation\n"), baseline, file);
});

test("moving documentation between site, package and shared paths preserves fingerprints", () => {
  assert.deepEqual(
    withChanges([
      ["development/ci-cd.md", null],
      ["docs/docs/ci-cd.md", tree.read("development/ci-cd.md")],
      ["apps/gateway/DESIGN.md", null],
      ["notes/gateway.md", tree.read("apps/gateway/DESIGN.md")],
      ["apps/admin/docs/screenshots/theme-desktop-light.png", null],
      [
        "development/images/theme-desktop-light.png",
        tree.read("apps/admin/docs/screenshots/theme-desktop-light.png"),
      ],
    ]),
    baseline
  );
});

for (const [file, owner] of [
  ["apps/gateway/example.config.yaml", "gateway"],
  ["apps/admin/src/docs-loader.ts", "admin"],
  ["apps/admin/public/logo.svg", "admin"],
  ["libs/db/prisma/migrations/new_change/migration.sql", "db"],
  ["libs/anime-matcher/python/model.bin", "anime-matcher"],
]) {
  test(`${file} remains a build input`, () => {
    assert.notEqual(
      withChange(file, "Changed runtime input\n").images[owner].fingerprint,
      baseline.images[owner].fingerprint
    );
  });
}

test("documentation files are absent from explained inputs", () => {
  for (const detail of Object.values(calculate(tree).details)) {
    const files = detail.inputs.map(([file]) => file);
    for (const file of [
      "development/ci-cd.md",
      "development/local-development.md",
      "common/scripts/BUILD_MANIFEST.md",
      "apps/gateway/AGENTS.md",
      "apps/admin/docs/screenshots/theme-desktop-light.png",
    ])
      assert.ok(!files.includes(file), file);
  }
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
