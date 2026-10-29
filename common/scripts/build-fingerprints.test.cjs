const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const { calculate } = require("./build-fingerprints.cjs");

// 覆盖当前工作树，新增 Rush 项目在提交前也能验证依赖图及输入范围。
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  {
    encoding: "utf8",
  }
)
  .split("\0")
  .filter(Boolean);
const entries = new Map(),
  contents = new Map();
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const stat = fs.lstatSync(file);
  const content = stat.isSymbolicLink()
    ? Buffer.from(fs.readlinkSync(file))
    : fs.readFileSync(file);
  entries.set(file, {
    mode: stat.isSymbolicLink()
      ? "120000"
      : stat.mode & 0o111
      ? "100755"
      : "100644",
    oid: createHash("sha1").update(content).digest("hex"),
  });
  contents.set(file, content.toString("utf8"));
}
const tree = {
  entries,
  read: (file) => {
    if (!contents.has(file)) throw new Error(`Missing test input: ${file}`);
    return contents.get(file);
  },
};
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
  "libs/llm-matcher/README.md",
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
  ["libs/llm-matcher/src/index.ts", "llm-matcher"],
  ["libs/llm-matcher/Dockerfile", "llm-matcher"],
  ["libs/llm-matcher/prompts/first.system.txt", "llm-matcher"],
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

test("external matcher source only invalidates its independent image", () => {
  const changed = withChange(
    "libs/llm-matcher/src/index.ts",
    "export const updated = true;\n"
  );
  const affected = Object.keys(baseline.images).filter(
    (app) =>
      baseline.images[app].fingerprint !== changed.images[app].fingerprint
  );
  assert.deepEqual(affected, ["llm-matcher"]);
});

test("external matcher includes its Rush importer and compiler dependencies", () => {
  const detail = calculate(tree).details["llm-matcher"];
  assert.deepEqual(detail.projects, ["@lani/llm-matcher"]);
  assert(
    detail.inputs.some(([file]) =>
      file.endsWith("#importers/../../libs/llm-matcher")
    )
  );
  assert(
    detail.inputs.some(([file]) => file.includes("#packages/typescript@"))
  );
  assert(
    !detail.inputs.some(([file]) => file.startsWith("libs/anime-matcher/"))
  );
  assert(!detail.inputs.some(([file]) => file.startsWith("apps/all-in-one/")));
});

for (const file of [
  ".github/workflows/build_generic.yaml",
  ".github/workflows/default_pipeline.yaml",
  ".github/workflows/test.yaml",
  ".github/scripts/release-plan.cjs",
  "common/scripts/build-fingerprints.cjs",
  "common/scripts/pnpm-fingerprint.cjs",
  "common/scripts/docs-only.cjs",
  "tools/cli/src/commands/build/index.ts",
  "tools/cli/bin/run",
  "tools/cli/scripts/generate-type.js",
  "start_tmux.sh",
  "tmux.conf",
  "lani.code-workspace",
  ".prettierrc.json",
]) {
  test(`${file} tooling changes do not invalidate applications`, () => {
    assert.deepEqual(withChange(file, "Changed tooling\n"), baseline);
    assert.deepEqual(withChange(file, null), baseline);
  });
}

for (const file of [".dockerignore", ".nvmrc", "common/config/rush/.npmrc"]) {
  test(`${file} remains a shared build input`, () => {
    const changed = withChange(file, "Changed build input\n");
    for (const app of Object.keys(baseline.images))
      assert.notEqual(
        changed.images[app].fingerprint,
        baseline.images[app].fingerprint
      );
  });
}

test("generic tooling sources are absent from every explained input list", () => {
  for (const detail of Object.values(calculate(tree).details)) {
    assert(!detail.inputs.some(([file]) => file.startsWith(".github/")));
    assert(!detail.inputs.some(([file]) => file.startsWith("common/scripts/")));
    assert(!detail.inputs.some(([file]) => file.startsWith("tools/cli/src/")));
  }
});
