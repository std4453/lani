"use strict";

const path = require("node:path");

// 只读取 pnpm 9 生成的块映射布局，不作为通用 YAML 解析器。
// 包元数据原文参与哈希；需要遍历的映射遇到其他布局时直接报错，避免漏算依赖。
function scalar(text) {
  if (text.startsWith('"')) return JSON.parse(text);
  if (/^'(?:[^']|'')*'$/.test(text))
    return text.slice(1, -1).replace(/''/g, "'");
  if (!text || /\s|^[&*!{[>|]/.test(text))
    throw new Error(`Unsupported pnpm lock scalar: ${text}`);
  return text;
}

function mapping(lines, indent) {
  const entries = new Map();
  let current;
  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const spaces = line.length - line.trimStart().length;
    if (spaces > indent && current) {
      current.body.push(line);
      continue;
    }
    const match = line
      .slice(indent)
      .match(/^('(?:[^']|'')*'|"(?:[^"\\]|\\.)*"|[^\s].*?):(?: (.*))?$/);
    if (spaces !== indent || !match)
      throw new Error(`Unsupported pnpm lock mapping: ${line}`);
    const key = scalar(match[1]);
    if (entries.has(key)) throw new Error(`Duplicate pnpm lock key: ${key}`);
    current = { value: match[2] || "", body: [] };
    entries.set(key, current);
  }
  return entries;
}

function children(entry, indent) {
  if (!entry) throw new Error("Missing pnpm lock mapping");
  if (entry.value === "{}" && entry.body.length === 0) return new Map();
  if (entry.value) throw new Error("Expected pnpm lock block mapping");
  return mapping(entry.body, indent);
}

function content(entry) {
  return [entry.value, ...entry.body].join("\n");
}

function readLock(text) {
  const root = mapping(text.replace(/\r\n/g, "\n").split("\n"), 0);
  if (
    !root.has("lockfileVersion") ||
    scalar(root.get("lockfileVersion").value) !== "9.0"
  )
    throw new Error("Package fingerprints require a pnpm 9 lockfile");
  const importers = children(root.get("importers"), 2);
  const packages = children(root.get("packages"), 2);
  const snapshots = children(root.get("snapshots"), 2);
  if (!importers.has(".") || content(importers.get(".")) !== "{}")
    throw new Error("Expected an empty Rush workspace root importer");
  const globals = [...root]
    .filter(([key]) => !["importers", "packages", "snapshots"].includes(key))
    .map(([key, entry]) => [key, content(entry)]);

  return function select(projectFolders) {
    const folders = new Set(projectFolders);
    const selected = new Map(
      globals.map(([key, value]) => [`global/${key}`, value])
    );
    const visited = new Set();

    function dependency(alias, reference, importer) {
      if (reference.startsWith("link:")) {
        if (!importer)
          throw new Error(`Unexpected workspace link in pnpm snapshot: ${alias}`);
        const target = path.posix.normalize(
          path.posix.join(importer, reference.slice(5))
        );
        if (!folders.has(target))
          throw new Error(
            `Workspace link outside project closure: ${alias} -> ${reference}`
          );
        return;
      }
      // npm alias 的值包含真实包名；普通 registry 引用仅包含版本和 peer 后缀。
      const id = snapshots.has(`${alias}@${reference}`)
        ? `${alias}@${reference}`
        : reference;
      if (visited.has(id)) return;
      const snapshot = snapshots.get(id);
      if (!snapshot)
        throw new Error(`Missing pnpm snapshot: ${alias}@${reference}`);
      visited.add(id);
      const packageId = id.split("(", 1)[0];
      const pkg = packages.get(packageId);
      if (!pkg) throw new Error(`Missing pnpm package: ${packageId}`);
      selected.set(`packages/${packageId}`, content(pkg));
      selected.set(`snapshots/${id}`, content(snapshot));
      edges(snapshot, false);
    }

    function edges(entry, importer) {
      const fields = children(entry, 4);
      const names = importer
        ? ["dependencies", "devDependencies", "optionalDependencies"]
        : ["dependencies", "optionalDependencies"];
      for (const field of names) {
        if (!fields.has(field)) continue;
        for (const [alias, record] of children(fields.get(field), 6)) {
          let value = record.value;
          if (importer) {
            const version = children(record, 8).get("version");
            if (!version || version.body.length)
              throw new Error(`Missing pnpm importer version: ${alias}`);
            value = version.value;
          } else if (record.body.length) {
            throw new Error(`Unsupported pnpm dependency: ${alias}`);
          }
          dependency(alias, scalar(value), importer);
        }
      }
    }

    for (const folder of folders) {
      const id = `../../${folder}`;
      const importer = importers.get(id);
      if (!importer) throw new Error(`Missing pnpm workspace importer: ${id}`);
      selected.set(`importers/${id}`, content(importer));
      edges(importer, folder);
    }
    return [...selected].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  };
}

module.exports = { readLock };
