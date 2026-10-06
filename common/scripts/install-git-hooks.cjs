#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
try {
  const root = git("rev-parse", "--show-toplevel");
  const configured = spawnSync("git", ["config", "--get", "core.hooksPath"], {
    encoding: "utf8",
  });
  if (![0, 1].includes(configured.status))
    throw new Error("Cannot read hook configuration");
  const existing = configured.stdout.trim();
  if (existing && existing !== ".githooks")
    throw new Error(
      `Existing core.hooksPath=${existing}; integrate pre-commit manually`
    );
  if (!existing) {
    const hook = git("rev-parse", "--git-path", "hooks/pre-commit");
    if (fs.existsSync(hook))
      throw new Error(
        "Existing pre-commit hook; integrate manually without overwriting it"
      );
  }
  const file = path.join(root, ".githooks/pre-commit");
  fs.chmodSync(file, 0o755);
  if (git("rev-parse", "--is-bare-repository") !== "false")
    throw new Error("Install hooks in a non-bare worktree");
  const explicitWorktree = spawnSync(
    "git",
    ["config", "--local", "--get", "core.worktree"],
    { encoding: "utf8" }
  );
  if (explicitWorktree.status === 0)
    throw new Error(
      "Explicit core.worktree configuration requires manual hook integration"
    );
  git("config", "--local", "extensions.worktreeConfig", "true");
  git("config", "--worktree", "core.hooksPath", ".githooks");
  console.log(
    "Installed .githooks in this worktree only; install it separately in each new worktree."
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
