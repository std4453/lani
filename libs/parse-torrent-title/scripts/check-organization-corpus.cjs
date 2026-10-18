#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");

const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const normalize = (value) =>
  value
    .replace(/[！-～]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .replace(/\s+/g, " ")
    .trim();
const groupSet = (values) => [...new Set(values.map(normalize))].sort();
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
// 基线是 JSON 快照，undefined 属性不属于快照中可观察的字段。
const snapshot = (value) => JSON.parse(JSON.stringify(value));
function withoutOrganization(value) {
  if (!value) return null;
  const { organization, ...rest } = snapshot(value);
  return rest;
}
function rejectExclusions(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (/exclu|in_scope|out_of_domain|skip/i.test(key))
      throw new Error(`Exclusion field is forbidden: ${key}`);
    rejectExclusions(child);
  }
}
function readRows(file) {
  const bytes = fs.readFileSync(file);
  const text = (
    file.endsWith(".gz") ? zlib.gunzipSync(bytes) : bytes
  ).toString();
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(JSON.parse);
  const ids = new Set();
  for (const row of rows) {
    rejectExclusions(row);
    if (
      !object(row) ||
      !(
        (typeof row.id === "number" && Number.isSafeInteger(row.id)) ||
        (typeof row.id === "string" && row.id.trim())
      ) ||
      typeof row.title !== "string" ||
      ids.has(String(row.id))
    )
      throw new Error(`Invalid or duplicate row in ${file}`);
    ids.add(String(row.id));
  }
  if (!rows.length) throw new Error("Inputs must not be empty");
  return { rows, hash: hash(bytes) };
}
function validGroups(groups, allowEmpty) {
  return (
    Array.isArray(groups) &&
    (allowEmpty || groups.length > 0) &&
    groups.every((group) => typeof group === "string" && normalize(group)) &&
    groupSet(groups).length === groups.length
  );
}
function organizationError(organization) {
  if (organization === undefined) return undefined;
  if (
    !object(organization) ||
    typeof organization.raw !== "string" ||
    !normalize(organization.raw) ||
    !validGroups(organization.parts, false)
  )
    return "Invalid organization: expected nonempty raw and unique nonempty parts, or undefined";
}
function wilson(successes, total) {
  if (!total) return null;
  const z = 1.959963984540054;
  const p = successes / total;
  const divisor = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / divisor;
  const radius =
    (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) /
    divisor;
  return [center - radius, center + radius];
}
function metrics(rows) {
  const correct = rows.filter((row) => row.correct).length;
  return {
    sample: rows.length,
    correct,
    accuracy: rows.length ? correct / rows.length : null,
    wilson95: wilson(correct, rows.length),
  };
}
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3 || args.some((arg) => arg.startsWith("--")))
    throw new Error(
      "Usage: check-organization-corpus.cjs baseline.ndjson[.gz] labels.ndjson report.json (exactly three arguments; exclusions forbidden)"
    );
  const [baselinePath, labelsPath, reportPath] = args;
  const baseline = readRows(baselinePath);
  const labels = readRows(labelsPath);
  const byId = new Map(baseline.rows.map((row) => [String(row.id), row]));
  for (const row of baseline.rows) {
    if (
      !Object.hasOwn(row, "parsed") ||
      !(row.parsed === null || object(row.parsed)) ||
      !object(row.names) ||
      !object(row.names.title)
    )
      throw new Error(`Invalid baseline snapshot: ${row.id}`);
  }
  for (const row of labels.rows) {
    const original = byId.get(String(row.id));
    if (
      !original ||
      !isDeepStrictEqual(original.id, row.id) ||
      original.title !== row.title
    )
      throw new Error(`Unknown or mismatched label id/title: ${row.id}`);
    if (
      !["ready", "pending"].includes(row.status) ||
      !validGroups(row.expected_groups, true)
    )
      throw new Error(`Invalid status or expected_groups: ${row.id}`);
  }
  const {
    default: parseTorrentTitle,
    parseTorrentNames,
    parseTorrentOrganization,
  } = require("../dist");
  const predictions = new Map();
  const invariantChanges = [],
    exceptions = [],
    organizationErrors = [];
  for (const row of baseline.rows) {
    try {
      const parsed = parseTorrentTitle(row.title);
      const names = parseTorrentNames(row.title);
      const direct = parseTorrentOrganization(row.title);
      if (
        !(parsed === undefined || parsed === null || object(parsed)) ||
        !object(names) ||
        !object(names.title)
      )
        throw new Error("Invalid parser result");
      const changes = [];
      const current = withoutOrganization(parsed);
      const before = withoutOrganization(row.parsed);
      if (!!parsed !== !!row.parsed || !isDeepStrictEqual(current, before))
        changes.push({
          field: "default except organization",
          before,
          after: current,
        });
      if (!isDeepStrictEqual(snapshot(names.title), row.names.title))
        changes.push({
          field: "parseTorrentNames.title",
          before: row.names.title,
          after: names.title,
        });
      if (changes.length)
        invariantChanges.push({ id: row.id, title: row.title, changes });
      const organization = (parsed || names).organization;
      const errors = [];
      for (const [source, result] of [
        ["default/fallback", organization],
        ["parseTorrentNames", names.organization],
        ["parseTorrentOrganization", direct],
      ]) {
        const error = organizationError(result);
        if (error) errors.push({ source, error, actual: result });
        if (!isDeepStrictEqual(result, direct))
          errors.push({
            source,
            error: "Organization differs from standalone parser",
            actual: result,
            expected: direct,
          });
      }
      if (errors.length)
        organizationErrors.push({ id: row.id, title: row.title, errors });
      predictions.set(String(row.id), {
        parts: organization?.parts ?? [],
        valid: !errors.length,
      });
    } catch (error) {
      exceptions.push({ id: row.id, title: row.title, error: String(error) });
    }
  }
  const evaluated = labels.rows.map((row) => {
    const predicted = predictions.get(String(row.id));
    const correct =
      row.status === "ready" &&
      predicted?.valid &&
      isDeepStrictEqual(
        groupSet(predicted.parts),
        groupSet(row.expected_groups)
      );
    return {
      ...row,
      actual: predicted?.parts ?? null,
      correct: Boolean(correct),
    };
  });
  const distHashes = {};
  function codeHashes(directory, prefix = "") {
    for (const entry of fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = prefix + entry.name;
      if (entry.isDirectory())
        codeHashes(path.join(directory, entry.name), relative + "/");
      else if (entry.name.endsWith(".js"))
        distHashes[relative] = hash(
          fs.readFileSync(path.join(directory, entry.name))
        );
    }
  }
  codeHashes(path.join(__dirname, "../dist"));
  const summary = {
    population: baseline.rows.length,
    ...metrics(evaluated),
    evaluatedSample: evaluated.length,
    excluded: 0,
    statuses: {
      ready: evaluated.filter((r) => r.status === "ready").length,
      pending: evaluated.filter((r) => r.status === "pending").length,
    },
    subsets: {
      withGroups: metrics(evaluated.filter((r) => r.expected_groups.length)),
      withoutGroups: metrics(
        evaluated.filter((r) => !r.expected_groups.length)
      ),
      jointGroups: metrics(
        evaluated.filter((r) => r.expected_groups.length > 1)
      ),
    },
    invariantChanges: invariantChanges.length,
    exceptions: exceptions.length,
    organizationErrors: organizationErrors.length,
    baselineHash: baseline.hash,
    labelsHash: labels.hash,
    checkerHash: hash(fs.readFileSync(__filename)),
    distHashes,
  };
  const passed =
    summary.correct * 100 >= summary.sample * 99 &&
    !invariantChanges.length &&
    !exceptions.length &&
    !organizationErrors.length;
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        passed,
        summary,
        invariantChanges,
        exceptions,
        organizationErrors,
        failures: evaluated.filter((row) => !row.correct),
      },
      null,
      2
    ) + "\n"
  );
  console.log(JSON.stringify(summary, null, 2));
  if (!passed) process.exitCode = 1;
}
try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
