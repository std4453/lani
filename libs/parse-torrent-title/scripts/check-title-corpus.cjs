#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const { default: parseTorrentTitle, parseTorrentNames } = require("../dist");
const [baselinePath, labelsPath, reportPath, exclusionsPath] =
  process.argv.slice(2);
const preservedFields = [
  "index",
  "episodeInfo",
  "subtitle",
  "subtitleInfo",
  "source",
  "format",
];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
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
    if (
      row.id == null ||
      typeof row.title !== "string" ||
      ids.has(String(row.id))
    ) {
      throw new Error(`Invalid or duplicate row in ${file}`);
    }
    ids.add(String(row.id));
  }
  return { rows, hash: sha256(bytes) };
}

function titleSet(values) {
  return [
    ...new Set(
      values.map((value) =>
        value
          .replace(/[！-～]/g, (char) =>
            String.fromCharCode(char.charCodeAt(0) - 0xfee0)
          )
          .replace(/\s+/g, " ")
          .trim()
      )
    ),
  ].sort();
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

function main() {
  if (!baselinePath || !labelsPath || !reportPath) {
    throw new Error(
      "Usage: check-title-corpus.cjs baseline.ndjson[.gz] labels.ndjson report.json [exclusions.ndjson]"
    );
  }
  const baseline = readRows(baselinePath);
  const labels = readRows(labelsPath);
  if (!baseline.rows.length || !labels.rows.length)
    throw new Error("Inputs must not be empty");
  const byId = new Map(baseline.rows.map((row) => [String(row.id), row]));
  for (const row of baseline.rows) {
    if (!Object.hasOwn(row, "parsed"))
      throw new Error("Baseline must contain parsed results");
  }
  const exclusions = exclusionsPath
    ? readRows(exclusionsPath)
    : { rows: [], hash: null };
  for (const row of exclusions.rows) {
    const original = byId.get(String(row.id));
    if (
      !original ||
      !isDeepStrictEqual(original.id, row.id) ||
      original.title !== row.title
    )
      throw new Error(`Unknown or mismatched exclusion: ${row.id}`);
    if (typeof row.reason !== "string" || !row.reason.trim())
      throw new Error(`Missing exclusion reason: ${row.id}`);
  }
  if (exclusions.rows.length * 100 > baseline.rows.length * 2)
    throw new Error("Exclusions exceed 2% of baseline population");
  const excludedIds = new Set(exclusions.rows.map((row) => String(row.id)));
  for (const row of labels.rows) {
    if (byId.get(String(row.id))?.title !== row.title)
      throw new Error(`Unknown or mismatched label: ${row.id}`);
    if (!["ready", "pending", "out_of_domain"].includes(row.status))
      throw new Error(`Invalid status: ${row.id}`);
    if (
      row.status === "ready" &&
      (!Array.isArray(row.expected_titles) ||
        !row.expected_titles.every((v) => typeof v === "string"))
    ) {
      throw new Error(`Invalid expected titles: ${row.id}`);
    }
  }
  const predictions = new Map();
  const invariantChanges = [];
  const exceptions = [];
  for (const row of baseline.rows) {
    try {
      const parsed = parseTorrentTitle(row.title);
      const names = parsed || parseTorrentNames(row.title);
      predictions.set(String(row.id), names.title.aliases);
      if (
        !!parsed !== !!row.parsed ||
        preservedFields.some(
          (field) => !isDeepStrictEqual(parsed?.[field], row.parsed?.[field])
        )
      ) {
        invariantChanges.push(row.id);
      }
    } catch (error) {
      exceptions.push({ id: row.id, error: String(error) });
    }
  }
  let correct = 0;
  let excludedSample = 0;
  const failures = [];
  const statuses = {};
  for (const row of labels.rows) {
    statuses[row.status] = (statuses[row.status] || 0) + 1;
    if (excludedIds.has(String(row.id))) {
      excludedSample++;
      continue;
    }
    const actual = predictions.get(String(row.id));
    const ok =
      row.status === "ready" &&
      actual &&
      isDeepStrictEqual(titleSet(actual), titleSet(row.expected_titles));
    if (ok) correct++;
    else failures.push({ ...row, actual });
  }
  const distHashes = {};
  for (const file of fs.readdirSync(path.join(__dirname, "../dist")).sort()) {
    if (file.endsWith(".js"))
      distHashes[file] = sha256(
        fs.readFileSync(path.join(__dirname, "../dist", file))
      );
  }
  // 只有显式例外名单命中的样本扣除；其余未定与范围外标注仍计入分母。
  const evaluatedSample = labels.rows.length - excludedSample;
  const summary = {
    population: baseline.rows.length,
    eligiblePopulation: baseline.rows.length - exclusions.rows.length,
    sample: labels.rows.length,
    evaluatedSample,
    excludedPopulation: exclusions.rows.length,
    excludedSample,
    correct,
    accuracy: evaluatedSample ? correct / evaluatedSample : null,
    wilson95: wilson(correct, evaluatedSample),
    statuses,
    excluded: excludedSample,
    invariantChanges: invariantChanges.length,
    exceptions: exceptions.length,
    preservedFields,
    baselineHash: baseline.hash,
    labelsHash: labels.hash,
    exclusionsHash: exclusions.hash,
    distHashes,
  };
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary,
        invariantChanges,
        exceptions,
        failures,
        exclusions: exclusions.rows.map(({ id, title, reason }) => ({
          id,
          title,
          reason,
        })),
      },
      null,
      2
    ) + "\n"
  );
  console.log(JSON.stringify(summary, null, 2));
  if (
    !evaluatedSample ||
    summary.accuracy < 0.98 ||
    invariantChanges.length ||
    exceptions.length
  )
    process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
