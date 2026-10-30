const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { calculate, jsonc } = require("./build-fingerprints.cjs");
const { fingerprintIgnore } = require("./fingerprint-ignore.cjs");
const { readLock } = require("./pnpm-fingerprint.cjs");

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
  ["apps/admin/src/docs-loader.ts", "admin"],
  ["apps/admin/public/logo.svg", "admin"],
  ["apps/admin/config/theme-loader.cjs", "admin"],
  ["apps/admin/.umirc.ts", "admin"],
  ["apps/admin/nginx.conf", "admin"],
  ["libs/db/prisma/schema.prisma", "db"],
  ["libs/anime-matcher/docker/install-dependencies.py", "anime-matcher"],
  ["libs/anime-matcher/pyproject.toml", "anime-matcher"],
  ["libs/anime-matcher/.dockerignore", "anime-matcher"],
  ["libs/db/prisma/migrations/new_change/migration.sql", "db"],
  ["libs/anime-matcher/python/model.bin", "anime-matcher"],
  ["apps/api-server/src/torrent-match/llm/index.service.ts", "api-server"],
  [
    "apps/api-server/src/torrent-match/llm/prompts/first.system.txt",
    "api-server",
  ],
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

test("embedded matcher prompts only invalidate the API image", () => {
  const changed = withChange(
    "apps/api-server/src/torrent-match/llm/prompts/first.system.txt",
    "Updated system prompt\n"
  );
  const affected = Object.keys(baseline.images).filter(
    (app) =>
      baseline.images[app].fingerprint !== changed.images[app].fingerprint
  );
  assert.deepEqual(affected, ["api-server"]);
});

test("embedded matcher does not introduce a standalone image", () => {
  assert(!Object.hasOwn(baseline.images, "llm-matcher"));
  assert(
    !calculate(tree).details["api-server"].projects.includes(
      "@lani/llm-matcher"
    )
  );
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
  ".nvmrc",
  "common/config/rush/.npmrc",
  "common/config/rush/pnpm-config.json",
  "apps/gateway/example.config.yaml",
  "apps/admin/.vscode/settings.json",
  "apps/admin/.eslintrc.js",
  "apps/admin/.prettierrc",
  "apps/admin/codegen.yml",
  "apps/admin/next.config.js",
  "apps/data-server/codegen.yml",
  "apps/data-server/src/scripts/generate-schema.ts",
  "apps/data-server/generated/.gitkeep",
  "apps/admin/src/pages/jobs/filters.test.ts",
  "apps/api-server/src/config/llm.spec.ts",
  "apps/api-server/samples/qbt-torrent-list.json",
  "libs/parse-nyaa/src/fixtures/subtitles/corpus.json",
  "libs/anime-matcher/tests/test_worker.py",
  "libs/anime-matcher/src/index.ts",
  "libs/anime-matcher/tsconfig.json",
  "libs/anime-matcher/docker/verify-image.py",
]) {
  test(`${file} tooling changes do not invalidate applications`, () => {
    assert.deepEqual(withChange(file, "Changed tooling\n"), baseline);
    assert.deepEqual(withChange(file, null), baseline);
  });
}

test("root Docker context rules only affect images built from the root", () => {
  const changed = withChange(".dockerignore", "Changed build input\n");
  for (const app of Object.keys(baseline.images))
    assert.equal(
      changed.images[app].fingerprint !== baseline.images[app].fingerprint,
      app !== "anime-matcher"
    );
});

for (const app of Object.keys(baseline.images)) {
  test(`${app} Dockerfile only affects its own image`, () => {
    const folder = ["db", "anime-matcher"].includes(app) ? "libs" : "apps";
    const changed = withChange(`${folder}/${app}/Dockerfile`, "FROM scratch\n");
    for (const other of Object.keys(baseline.images))
      assert.equal(
        changed.images[other].fingerprint !==
          baseline.images[other].fingerprint,
        other === app
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

test("Rush metadata and ordering do not directly affect fingerprints", () => {
  const rush = jsonc(tree.read("rush.json"));
  rush.projects.reverse();
  rush.rushVersion = "0.0.0";
  rush.eventHooks = { preRushBuild: ["echo changed"] };
  assert.deepEqual(withChange("rush.json", JSON.stringify(rush)), baseline);
  assert.deepEqual(
    withChange(
      "common/config/rush/deploy.json",
      tree.read("common/config/rush/deploy.json") + "\n// comment\n"
    ),
    baseline
  );
});

test("package.json is hashed whole for Node images but not the Python image", () => {
  for (const [file, app] of [
    ["apps/gateway/package.json", "gateway"],
    ["libs/anime-matcher/package.json", "anime-matcher"],
  ]) {
    const pkg = JSON.parse(tree.read(file));
    pkg.description = "Updated package metadata";
    const changed = withChange(file, JSON.stringify(pkg));
    assert.equal(
      changed.images[app].fingerprint !== baseline.images[app].fingerprint,
      app !== "anime-matcher"
    );
  }
});

test("ignore comments and unmatched rules do not change fingerprints", () => {
  assert.deepEqual(
    withChange(
      ".fingerprintignore",
      tree.read(".fingerprintignore") + "\n# explanation\n/nonexistent/\n"
    ),
    baseline
  );
});

test("negation restores a file as a fingerprint input", () => {
  const rules = tree.read(".fingerprintignore") + "\n!**/example.config.yaml\n";
  const before = withChange(".fingerprintignore", rules);
  const after = withChanges([
    [".fingerprintignore", rules],
    ["apps/gateway/example.config.yaml", "changed example\n"],
  ]);
  assert.notEqual(
    before.images.gateway.fingerprint,
    after.images.gateway.fingerprint
  );
});

test("gitignore semantics and explanations are supplied by ignore", () => {
  const rules = new Map([
    [
      ".fingerprintignore",
      "/root-only.txt\n*.test.ts\n!keep.test.ts\nblocked/\n!blocked/keep.ts\n\\#literal\nspace\\ \n",
    ],
    [
      "common/config/fingerprints/admin.ignore",
      "!special.test.ts\nadmin-only.ts\n",
    ],
  ]);
  const fixture = { entries: rules, read: (file) => rules.get(file) };
  const ignored = fingerprintIgnore(fixture, "admin");
  assert.equal(ignored("nested/root-only.txt"), undefined);
  assert.equal(ignored("keep.test.ts"), undefined);
  assert.equal(ignored("special.test.ts"), undefined);
  assert.equal(ignored("UPPER.TEST.TS"), undefined);
  for (const file of [
    "root-only.txt",
    "nested/foo.test.ts",
    "#literal",
    "space ",
  ])
    assert.ok(ignored(file), file);
  assert.deepEqual(ignored("blocked/keep.ts"), {
    source: ".fingerprintignore:4",
    pattern: "blocked/",
  });
  assert.deepEqual(ignored("admin-only.ts"), {
    source: "common/config/fingerprints/admin.ignore:2",
    pattern: "admin-only.ts",
  });
  assert.equal(
    fingerprintIgnore(fixture, "gateway")("admin-only.ts"),
    undefined
  );
});

test("explain lists ignored files with the matching rule", () => {
  const details = calculate(tree).details;
  const excluded = details.admin.excluded.find(
    ({ file }) => file === "apps/admin/jest.config.js"
  );
  assert.equal(excluded.pattern, "jest.config.*");
  assert.match(excluded.source, /^\.fingerprintignore:\d+$/);
  assert(
    !details["anime-matcher"].inputs.some(([file]) =>
      file.includes("pnpm-lock.yaml")
    )
  );
});

test("lockfile changes only affect the selected dependency graph", () => {
  const lock = `lockfileVersion: '9.0'
overrides:
  unrelated: 1.0.0
pnpmfileChecksum: original
importers:
  .: {}
  ../../apps/one:
    dependencies:
      direct:
        specifier: ^1
        version: 1.0.0
  ../../apps/two:
    dependencies:
      unrelated:
        specifier: ^1
        version: 1.0.0
packages:
  direct@1.0.0:
    resolution: {integrity: direct}
  transitive@1.0.0:
    resolution: {integrity: transitive}
  unrelated@1.0.0:
    resolution: {integrity: unrelated}
snapshots:
  direct@1.0.0:
    optionalDependencies:
      transitive: 1.0.0
  transitive@1.0.0: {}
  unrelated@1.0.0: {}
`;
  const select = (value) => readLock(value)(["apps/one"]);
  for (const [from, to] of [
    ["unrelated: 1.0.0", "unrelated: 2.0.0"],
    ["pnpmfileChecksum: original", "pnpmfileChecksum: updated"],
    ["integrity: unrelated", "integrity: new-unrelated"],
  ])
    assert.deepEqual(select(lock.replace(from, to)), select(lock));
  assert.notDeepEqual(
    select(lock.replace("integrity: transitive", "integrity: updated")),
    select(lock)
  );
  assert.throws(
    () => select(lock.replace("version: 1.0.0", "version: 9.0.0")),
    /Missing pnpm snapshot/
  );
});

test("generating from the index tolerates unstaged tool edits and protects partial staging", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "lani-manifest-index-")
  );
  const git = (...args) =>
    execFileSync("git", args, { cwd: directory, encoding: "utf8" });
  const write = (file, content) => {
    const target = path.join(directory, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  try {
    git("init", "--quiet");
    for (const file of tree.entries.keys())
      if (
        file === "rush.json" ||
        file === ".fingerprintignore" ||
        file.startsWith("common/config/fingerprints/") ||
        file === "common/config/rush/deploy.json" ||
        file === "common/config/rush/pnpm-lock.yaml" ||
        file.endsWith("/package.json")
      )
        write(file, tree.read(file));
    write("common/scripts/build-fingerprints.cjs", "staged tool source\n");
    write("apps/api-server/partial.ts", "staged application source\n");
    git("add", ".");
    write("common/scripts/build-fingerprints.cjs", "unstaged tool source\n");
    write("apps/api-server/partial.ts", "unstaged application source\n");
    write(
      ".fingerprintignore",
      tree.read(".fingerprintignore") + "\n/apps/api-server/partial.ts\n"
    );
    const generator = path.join(__dirname, "build-fingerprints.cjs");
    execFileSync(process.execPath, [generator, "generate", "--staged"], {
      cwd: directory,
    });
    assert.equal(
      git("show", ":apps/api-server/partial.ts"),
      "staged application source\n"
    );
    assert.equal(
      fs.readFileSync(
        path.join(directory, "apps/api-server/partial.ts"),
        "utf8"
      ),
      "unstaged application source\n"
    );
    assert.equal(
      git("show", ":common/scripts/build-fingerprints.cjs"),
      "staged tool source\n"
    );
    const manifest = fs.readFileSync(
      path.join(directory, "build-manifest.json"),
      "utf8"
    );
    assert.equal(git("show", ":build-manifest.json"), manifest);
    write("apps/api-server/partial.ts", "second staged application source\n");
    git("add", "apps/api-server/partial.ts");
    execFileSync(process.execPath, [generator, "generate", "--staged"], {
      cwd: directory,
    });
    const updated = fs.readFileSync(
      path.join(directory, "build-manifest.json"),
      "utf8"
    );
    assert.notEqual(
      JSON.parse(updated).images["api-server"].fingerprint,
      JSON.parse(manifest).images["api-server"].fingerprint,
      "Unstaged ignore rules must not exclude the staged application source"
    );
    write("build-manifest.json", manifest + " ");
    assert.throws(
      () =>
        execFileSync(process.execPath, [generator, "generate", "--staged"], {
          cwd: directory,
          stdio: "pipe",
        }),
      /Manifest has unstaged changes/
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
