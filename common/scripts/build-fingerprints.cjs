#!/usr/bin/env node
"use strict";

// No package installation, checkout, Git filters, or project code execution.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const manifestPath = "build-manifest.json";
const scriptPath = "common/scripts/build-fingerprints.cjs";
const apps = ["admin", "api-server", "data-server", "gateway", "db"];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const git = (args, options = {}) =>
  execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });

function jsonc(text) {
  let out = "",
    quoted = false,
    escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      out += c;
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') {
      quoted = true;
      out += c;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i + 1 < text.length && text[i + 1] !== "\n") i++;
      out += " ";
    } else if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      if (end < 0) throw new Error("Unterminated JSON comment");
      i = end + 1;
      out += " ";
    } else out += c;
  }
  let clean = "";
  quoted = false;
  escaped = false;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (!quoted && c === "," && /^[\s]*[}\]]/.test(out.slice(i + 1))) continue;
    clean += c;
    if (escaped) escaped = false;
    else if (quoted && c === "\\") escaped = true;
    else if (c === '"') quoted = !quoted;
  }
  return JSON.parse(clean);
}

function snapshot(ref) {
  if (ref !== "INDEX" && !/^[a-f0-9]{40}$/.test(ref))
    throw new Error("Use a complete commit SHA");
  const staged = ref === "INDEX";
  const entries = new Map();
  const raw = git(
    staged ? ["ls-files", "--stage", "-z"] : ["ls-tree", "-r", "-z", ref]
  );
  for (const item of raw.split("\0").filter(Boolean)) {
    const tab = item.indexOf("\t"),
      file = item.slice(tab + 1);
    const [mode, second, third] = item.slice(0, tab).split(" ");
    if (staged && third !== "0")
      throw new Error(`Unresolved index conflict: ${file}`);
    if (!staged && second !== "blob")
      throw new Error(`Unsupported Git entry: ${file}`);
    if (!["100644", "100755", "120000"].includes(mode))
      throw new Error(`Unsupported Git mode: ${file}`);
    entries.set(file, { mode, oid: staged ? second : third });
  }
  const cache = new Map();
  function read(file) {
    const entry = entries.get(file);
    if (!entry) throw new Error(`Missing tracked input: ${file}`);
    if (!cache.has(entry.oid))
      cache.set(entry.oid, git(["cat-file", "blob", entry.oid]));
    return cache.get(entry.oid);
  }
  return { entries, read };
}

function calculate(tree) {
  const rush = jsonc(tree.read("rush.json"));
  if (!Array.isArray(rush.projects))
    throw new Error("Missing Rush project graph");
  const projects = new Map();
  for (const project of rush.projects) {
    const name = project.packageName,
      folder = project.projectFolder;
    if (
      typeof name !== "string" ||
      typeof folder !== "string" ||
      !/^[a-zA-Z0-9_./-]+$/.test(folder) ||
      folder.startsWith("/") ||
      folder.split("/").some((p) => !p || p === "." || p === "..") ||
      projects.has(name)
    ) {
      throw new Error("Invalid or duplicate Rush project");
    }
    const pkg = jsonc(tree.read(`${folder}/package.json`));
    if (pkg.name !== name)
      throw new Error(`Rush/package identity mismatch: ${name}`);
    projects.set(name, { folder, pkg, dependencies: new Set() });
  }
  const deploy = jsonc(tree.read("common/config/rush/deploy.json"));
  for (const [name, project] of projects) {
    for (const field of [
      "dependencies",
      "devDependencies",
      "optionalDependencies",
      "peerDependencies",
    ]) {
      for (const dependency of Object.keys(project.pkg[field] || {})) {
        if (projects.has(dependency)) project.dependencies.add(dependency);
        else if (dependency.startsWith("@lani/"))
          throw new Error(`Unresolved local dependency: ${dependency}`);
      }
    }
    for (const setting of deploy.projectSettings || [])
      if (setting.projectName === name) {
        for (const dependency of [
          ...(setting.additionalProjectsToInclude || []),
          ...(setting.additionalDependenciesToInclude || []),
        ]) {
          if (projects.has(dependency)) project.dependencies.add(dependency);
          else if (dependency.startsWith("@lani/"))
            throw new Error(`Unresolved deploy dependency: ${dependency}`);
        }
      }
  }
  const excluded = (file) =>
    file === manifestPath ||
    [
      "README.md",
      "AGENTS.md",
      "CLAUDE.md",
      "CONTRIBUTING.md",
      "LICENSE",
      ".github/README.md",
    ].includes(file) ||
    file.startsWith("docs/") ||
    file.startsWith("common/git-hooks/") ||
    file === ".github/workflows/manifest-check.yaml";
  const owner = (file) =>
    [...projects].find(([, p]) => file.startsWith(`${p.folder}/`))?.[0];
  const global = [...tree.entries.keys()].filter(
    (file) => !excluded(file) && !owner(file)
  );
  const details = {},
    images = {};
  for (const app of apps) {
    const closure = new Set();
    function visit(name) {
      if (closure.has(name)) return;
      const project = projects.get(name);
      if (!project) throw new Error(`Missing application project: ${name}`);
      closure.add(name);
      for (const dependency of project.dependencies) visit(dependency);
    }
    visit(`@lani/${app}`);
    const files = new Set(global);
    for (const file of tree.entries.keys())
      if (closure.has(owner(file)) && !excluded(file)) files.add(file);
    // Symlink path/mode/blob are inputs too. Targets must belong to the declared
    // project/dependency closure; cross-project build inputs need a Rush dependency.
    const inputs = [...files]
      .sort()
      .map((file) => [
        file,
        tree.entries.get(file).mode,
        tree.entries.get(file).oid,
      ]);
    const fingerprint = sha256(
      JSON.stringify({
        algorithmVersion: 1,
        platform: "linux/amd64",
        app,
        inputs,
      })
    );
    images[app] = { fingerprint };
    details[app] = { fingerprint, projects: [...closure].sort(), inputs };
  }
  return { manifest: { version: 1, algorithmVersion: 1, images }, details };
}

function check(ref) {
  const tree = snapshot(ref),
    result = calculate(tree);
  const actual = JSON.parse(tree.read(manifestPath));
  if (JSON.stringify(actual) !== JSON.stringify(result.manifest)) {
    throw new Error(
      "build-manifest.json is stale. Stage source changes, then run: node common/scripts/build-fingerprints.cjs generate --staged"
    );
  }
  return result;
}

function generate() {
  const root = git(["rev-parse", "--show-toplevel"]).trim();
  process.chdir(root);
  const tree = snapshot("INDEX");
  const file = path.join(root, manifestPath);
  if (
    fs.existsSync(file) &&
    (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink())
  )
    throw new Error("Manifest must be a regular file");
  if (tree.entries.has(manifestPath)) {
    if (
      !fs.existsSync(file) ||
      fs.readFileSync(file, "utf8") !== tree.read(manifestPath)
    )
      throw new Error(
        "Manifest has unstaged changes; stage or resolve it before generating"
      );
  } else if (fs.existsSync(file))
    throw new Error(
      "Untracked manifest exists; inspect and stage it before generating"
    );
  if (tree.read(scriptPath) !== fs.readFileSync(__filename, "utf8"))
    throw new Error("Stage fingerprint script changes before generating");
  const content = JSON.stringify(calculate(tree).manifest, null, 2) + "\n";
  const oid = git(["hash-object", "-w", "--stdin"], { input: content }).trim();
  // Only this generated path is updated; partial staging of every other path is preserved.
  git([
    "update-index",
    "--add",
    "--cacheinfo",
    `100644,${oid},${manifestPath}`,
  ]);
  fs.writeFileSync(file, content);
}

function main(args) {
  if (args.join(" ") === "generate --staged") return generate();
  if (
    !["check", "explain"].includes(args[0]) ||
    args[1] !== "--ref" ||
    (args[0] === "check"
      ? args.length !== 3
      : args.length !== 5 || args[3] !== "--app" || !apps.includes(args[4]))
  ) {
    throw new Error(
      "Usage: generate --staged | check --ref SHA | explain --ref SHA --app APP"
    );
  }
  const result =
    args[0] === "check" ? check(args[2]) : calculate(snapshot(args[2]));
  console.log(
    JSON.stringify(
      args[0] === "check" ? result.manifest : result.details[args[4]],
      null,
      2
    )
  );
}
module.exports = { apps, calculate, snapshot, check, jsonc, sha256 };
if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
