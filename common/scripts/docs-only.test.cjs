const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { isDocsOnlyChange } = require("./docs-only.cjs");

function repository(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "lani-docs-test-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  git("init", "-q");
  git("config", "user.name", "CI test");
  git("config", "user.email", "ci@example.invalid");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", path.join(cwd, "no-hooks"));
  function commit(files) {
    for (const [file, content] of Object.entries(files)) {
      const fullPath = path.join(cwd, file);
      if (content === null) fs.rmSync(fullPath);
      else {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content);
      }
    }
    git("add", "-A");
    git("commit", "-qm", "test fixture");
    return git("rev-parse", "HEAD");
  }
  const base = commit({
    "docs/intro.md": "Original docs\n",
    ".github/workflows/docs.yaml": "name: Docs\n",
    "apps/admin/main.ts": "export const value = 1;\n",
  });
  return { cwd, git, commit, base };
}

function events(base, head) {
  return [
    ["push", { before: base, after: head }],
    [
      "pull_request",
      { pull_request: { base: { sha: base }, head: { sha: head } } },
    ],
  ];
}

test("automatic docs and docs workflow edits skip application CI", (t) => {
  const repo = repository(t);
  const head = repo.commit({
    "docs/intro.md": "Updated docs\n",
    ".github/workflows/docs.yaml": "name: Updated docs\n",
    "docs/image with\nnewline.svg": "<svg/>\n",
  });
  for (const [name, event] of events(repo.base, head))
    assert.equal(isDocsOnlyChange(name, event, repo.cwd), true);
});

test("the CLI writes the skip decision used by workflow jobs", (t) => {
  const repo = repository(t);
  const head = repo.commit({ "docs/intro.md": "Updated docs\n" });
  const payload = path.join(repo.cwd, "event.json");
  const output = path.join(repo.cwd, "output");
  const summary = path.join(repo.cwd, "summary");
  fs.writeFileSync(payload, JSON.stringify({ before: repo.base, after: head }));
  execFileSync(process.execPath, [path.join(__dirname, "docs-only.cjs")], {
    cwd: repo.cwd,
    env: {
      ...process.env,
      GITHUB_EVENT_NAME: "push",
      GITHUB_EVENT_PATH: payload,
      GITHUB_OUTPUT: output,
      GITHUB_STEP_SUMMARY: summary,
    },
  });
  assert.equal(fs.readFileSync(output, "utf8"), "docs_only=true\n");
  assert.match(fs.readFileSync(summary, "utf8"), /deployment are skipped/);
});

test("docs deletions remain docs-only", (t) => {
  const repo = repository(t);
  const head = repo.commit({ "docs/intro.md": null });
  assert.equal(
    isDocsOnlyChange("push", { before: repo.base, after: head }, repo.cwd),
    true
  );
});

for (const file of [
  "apps/admin/main.ts",
  "apps/api-server/README.md",
  "common/config/rush/pnpm-lock.yaml",
  ".github/workflows/default_pipeline.yaml",
  "build-manifest.json",
  "docs-other/intro.md",
]) {
  test(`mixed change retains application CI: ${file}`, (t) => {
    const repo = repository(t);
    const head = repo.commit({
      "docs/intro.md": "Updated docs\n",
      [file]: "Changed\n",
    });
    for (const [name, event] of events(repo.base, head))
      assert.equal(isDocsOnlyChange(name, event, repo.cwd), false);
  });
}

test("renaming application code into docs cannot hide an application deletion", (t) => {
  const repo = repository(t);
  const head = repo.commit({
    "apps/admin/main.ts": null,
    "docs/main.ts": "export const value = 1;\n",
  });
  for (const [name, event] of events(repo.base, head))
    assert.equal(isDocsOnlyChange(name, event, repo.cwd), false);
});

test("an application change beyond 300 doc paths is still detected", (t) => {
  const repo = repository(t);
  const files = Object.fromEntries(
    Array.from({ length: 350 }, (_, i) => [`docs/${i}.md`, "Docs\n"])
  );
  files["libs/db/schema.sql"] = "SELECT 1;\n";
  const head = repo.commit(files);
  for (const [name, event] of events(repo.base, head))
    assert.equal(isDocsOnlyChange(name, event, repo.cwd), false);
});

test("push examines every commit, not just the final documentation commit", (t) => {
  const repo = repository(t);
  repo.commit({ "apps/admin/main.ts": "export const value = 2;\n" });
  const head = repo.commit({ "docs/intro.md": "Updated docs\n" });
  assert.equal(
    isDocsOnlyChange("push", { before: repo.base, after: head }, repo.cwd),
    false
  );
});

test("PR comparison excludes unrelated changes that advanced its base branch", (t) => {
  const repo = repository(t);
  const head = repo.commit({ "docs/intro.md": "Updated docs\n" });
  repo.git("checkout", "-q", "--detach", repo.base);
  const base = repo.commit({
    "apps/admin/main.ts": "export const value = 2;\n",
  });
  assert.equal(
    isDocsOnlyChange("pull_request", events(base, head)[1][1], repo.cwd),
    true
  );
});

test("manual requests, new branches and empty diffs do not suppress applications", (t) => {
  const repo = repository(t);
  assert.equal(isDocsOnlyChange("workflow_dispatch", {}, repo.cwd), false);
  assert.equal(
    isDocsOnlyChange(
      "push",
      { before: "0".repeat(40), after: repo.base },
      repo.cwd
    ),
    false
  );
  assert.equal(
    isDocsOnlyChange("push", { before: repo.base, after: repo.base }, repo.cwd),
    false
  );
});

test("invalid payloads and missing commits fail instead of claiming docs-only", (t) => {
  const repo = repository(t);
  assert.throws(
    () =>
      isDocsOnlyChange(
        "push",
        { before: "--help", after: repo.base },
        repo.cwd
      ),
    /complete base and head/
  );
  assert.throws(
    () => isDocsOnlyChange("pull_request", {}, repo.cwd),
    /complete base and head/
  );
  assert.throws(
    () =>
      isDocsOnlyChange(
        "push",
        { before: "f".repeat(40), after: repo.base },
        repo.cwd
      ),
    /Command failed/
  );
});
