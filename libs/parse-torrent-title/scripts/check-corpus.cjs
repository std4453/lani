#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");

const distDirectory = path.join(__dirname, "../dist");
const initialDistHash = sha256Directory(distDirectory);
const parseTorrentTitle = require("../dist").default;
const [baselinePath, eligibilityPath, reviewsPath, labelsPath] =
  process.argv.slice(2);
const FAILURE_LIMIT = 0.03;
const resultFields = [
  "title",
  "organization",
  "index",
  "episodeInfo",
  "source",
  "format",
  "subtitle",
];

function fail(message) {
  throw new Error(message);
}

function readNdjson(filePath, label) {
  if (!filePath) fail(`Missing ${label} input path`);
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        fail(`${label} line ${index + 1} is not valid JSON: ${error.message}`);
      }
    });
}

function sha256File(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function sha256Directory(directory) {
  const hash = crypto.createHash("sha256");
  function visit(current, relative = "") {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const relativePath = path.posix.join(relative, entry.name);
      if (entry.isDirectory())
        visit(path.join(current, entry.name), relativePath);
      else if (entry.isFile()) {
        hash.update(relativePath);
        hash.update(fs.readFileSync(path.join(current, entry.name)));
      }
    }
  }
  visit(directory);
  return hash.digest("hex");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])])
    );
  }
  return value;
}

function equal(left, right) {
  return isDeepStrictEqual(stable(left), stable(right));
}

function indexValue(result) {
  return result?.index ?? null;
}

function addChange(changes, row, fieldPath, oldValue, newValue) {
  changes.push({
    id: row.id,
    title: row.title,
    path: fieldPath,
    old: oldValue === undefined ? null : oldValue,
    new: newValue === undefined ? null : newValue,
  });
}

function compareResult(row, oldResult, newResult) {
  const changes = [];
  if (!oldResult && !newResult) return changes;

  // A changed or newly available episode index is the primary parse contract.
  if (!oldResult || !newResult) {
    const oldIndex = indexValue(oldResult);
    const newIndex = indexValue(newResult);
    if (!equal(oldIndex, newIndex))
      addChange(changes, row, "index", oldIndex, newIndex);
    if (newResult?.episodeInfo?.type !== "episode" && newResult?.episodeInfo)
      addChange(changes, row, "episodeInfo", null, newResult.episodeInfo);
    else if (
      oldResult?.episodeInfo?.type !== "episode" &&
      oldResult?.episodeInfo
    )
      addChange(changes, row, "episodeInfo", oldResult.episodeInfo, null);
    return changes;
  }

  for (const field of resultFields) {
    const oldHas = Object.prototype.hasOwnProperty.call(oldResult, field);
    const newHas = Object.prototype.hasOwnProperty.call(newResult, field);
    const oldValue = oldHas ? oldResult[field] : undefined;
    const newValue = newHas ? newResult[field] : undefined;
    if (field === "episodeInfo" && !oldHas && newValue?.type === "episode")
      continue; // Ordinary episodeInfo duplicates the existing index contract.

    if (field === "source" || field === "format") {
      if (
        (oldHas &&
          (!oldValue ||
            typeof oldValue !== "object" ||
            Array.isArray(oldValue))) ||
        (newHas &&
          (!newValue ||
            typeof newValue !== "object" ||
            Array.isArray(newValue)))
      ) {
        if (!equal(oldValue, newValue))
          addChange(changes, row, field, oldValue, newValue);
        continue;
      }
      const previous = oldValue && typeof oldValue === "object" ? oldValue : {};
      const current = newValue && typeof newValue === "object" ? newValue : {};
      for (const key of Object.keys(previous)) {
        if (
          !Object.prototype.hasOwnProperty.call(current, key) ||
          !equal(previous[key], current[key])
        ) {
          addChange(
            changes,
            row,
            `${field}.${key}`,
            previous[key],
            current[key]
          );
        }
      }
      continue;
    }

    if (field === "subtitle") {
      if (
        (oldHas &&
          (!oldValue ||
            typeof oldValue !== "object" ||
            Array.isArray(oldValue))) ||
        (newHas &&
          (!newValue ||
            typeof newValue !== "object" ||
            Array.isArray(newValue)))
      ) {
        if (!equal(oldValue, newValue))
          addChange(changes, row, field, oldValue, newValue);
        continue;
      }
      const previous = oldValue && typeof oldValue === "object" ? oldValue : {};
      const current = newValue && typeof newValue === "object" ? newValue : {};
      for (const key of Object.keys(previous)) {
        const before = previous[key];
        const after = Object.prototype.hasOwnProperty.call(current, key)
          ? current[key]
          : undefined;
        const typeChanged =
          after !== undefined && typeof before !== typeof after;
        const booleanLoss =
          typeof before === "boolean" && before === true && after !== true;
        const nonBooleanTypeChanged =
          typeof before === "boolean" &&
          before === false &&
          after !== undefined &&
          typeof after !== "boolean";
        const exactChanged =
          typeof before !== "boolean" && !equal(before, after);
        if (
          typeChanged ||
          booleanLoss ||
          nonBooleanTypeChanged ||
          exactChanged
        ) {
          addChange(changes, row, `${field}.${key}`, before, after);
        }
      }
      continue;
    }

    if (!equal(oldValue, newValue)) {
      addChange(changes, row, field, oldValue, newValue);
    }
  }
  return changes;
}

function indexUnique(rows, label) {
  const byId = new Map();
  for (const row of rows) {
    if (
      !row ||
      (typeof row.id !== "string" && typeof row.id !== "number") ||
      typeof row.title !== "string"
    ) {
      fail(`${label} rows require string title and string/number id`);
    }
    if (byId.has(row.id)) fail(`${label} contains duplicate id ${row.id}`);
    if (
      label === "baseline" &&
      (!Object.prototype.hasOwnProperty.call(row, "parsed") ||
        (row.parsed !== null &&
          (!row.parsed ||
            typeof row.parsed !== "object" ||
            Array.isArray(row.parsed))))
    ) {
      fail(`Baseline row ${row.id} must have parsed as an object or null`);
    }
    byId.set(row.id, row);
  }
  return byId;
}

function reviewKey(change) {
  return JSON.stringify(stable(change));
}

function changeIdentity(change) {
  return reviewKey({
    id: change.id,
    title: change.title,
    path: change.path,
    old: change.old,
    new: change.new,
  });
}

function main() {
  if (process.argv.length !== 5 && process.argv.length !== 6) {
    fail(
      "Usage: node scripts/check-corpus.cjs <baseline.ndjson> <eligibility.ndjson> <reviewed-changes.ndjson> [expected-indices.ndjson]"
    );
  }
  if (process.argv.length === 6 && !labelsPath)
    fail("Expected indices input path must not be empty");
  const baseline = readNdjson(baselinePath, "baseline");
  if (!baseline.length) fail("Baseline must not be empty");
  const eligibility = readNdjson(eligibilityPath, "eligibility");
  const reviews = readNdjson(reviewsPath, "reviewed changes");
  const baselineById = indexUnique(baseline, "baseline");
  const eligibilityById = indexUnique(eligibility, "eligibility");
  const labels = labelsPath ? readNdjson(labelsPath, "expected indices") : [];
  const labelsById = indexUnique(labels, "expected indices");
  if (labelsPath && !labels.length) fail("Expected indices must not be empty");
  const validNumber = (value) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;
  for (const label of labels) {
    if (baselineById.get(label.id)?.title !== label.title)
      fail(`Expected index title/id mismatch for id ${label.id}`);
    if (
      !Object.prototype.hasOwnProperty.call(label, "index") ||
      !(
        label.index === null ||
        validNumber(label.index) ||
        (label.index &&
          validNumber(label.index.from) &&
          validNumber(label.index.to) &&
          label.index.from <= label.index.to)
      ) ||
      typeof label.reason !== "string" ||
      !label.reason.trim()
    )
      fail(
        `Expected index ${label.id} requires a valid index or null and a reason`
      );
  }
  if (baselineById.size !== eligibilityById.size)
    fail("Baseline and eligibility row counts differ");
  for (const [id, row] of baselineById) {
    const eligible = eligibilityById.get(id);
    if (!eligible) fail(`Eligibility is missing baseline id ${id}`);
    if (eligible.title !== row.title) fail(`Title mismatch for id ${id}`);
    if (typeof eligible.eligible !== "boolean")
      fail(`Eligibility for id ${id} must be boolean`);
  }

  const accepted = new Map();
  for (const review of reviews) {
    if (
      !review ||
      (typeof review.id !== "string" && typeof review.id !== "number") ||
      typeof review.title !== "string" ||
      typeof review.path !== "string" ||
      !review.path ||
      review.status !== "accepted" ||
      typeof review.reason !== "string" ||
      !review.reason.trim() ||
      !Object.prototype.hasOwnProperty.call(review, "old") ||
      !Object.prototype.hasOwnProperty.call(review, "new")
    ) {
      fail(
        "Each reviewed change needs id, title, path, old, new, nonempty reason, and status 'accepted'"
      );
    }
    const key = changeIdentity(review);
    if (accepted.has(key))
      fail(`Duplicate reviewed change for id ${review.id} path ${review.path}`);
    accepted.set(key, review);
  }

  const diffs = [];
  let eligibleCount = 0;
  let eligibleFailures = 0;
  let exceptions = 0;
  const indexErrors = [];
  for (const row of baseline) {
    const eligible = eligibilityById.get(row.id).eligible;
    if (eligible) eligibleCount++;
    let current;
    try {
      current = parseTorrentTitle(row.title);
    } catch (error) {
      exceptions++;
      if (eligible) eligibleFailures++;
      diffs.push({
        id: row.id,
        title: row.title,
        path: "exception",
        old: null,
        new: String(error.message || error),
      });
      continue;
    }
    // A type-only special is useful metadata, but has not recovered an index.
    if ((current?.episodeInfo?.index ?? current?.index) == null && eligible)
      eligibleFailures++;
    const label = labelsById.get(row.id);
    if (label && !equal(label.index, indexValue(current))) {
      indexErrors.push({
        id: row.id,
        expected: label.index,
        actual: indexValue(current),
        kind: current ? "wrong_successful_index" : "missed_index",
      });
    }
    diffs.push(...compareResult(row, row.parsed || null, current || null));
  }

  const reviewIdentities = new Set(accepted.keys());
  const missingReviews = diffs.filter(
    (diff) => !reviewIdentities.has(changeIdentity(diff))
  );
  const diffIdentities = new Set(diffs.map(changeIdentity));
  const staleReviews = reviews.filter(
    (review) => !diffIdentities.has(changeIdentity(review))
  );
  if (!eligibleCount)
    fail("Eligibility must contain at least one eligible title");
  const failureRate = eligibleCount ? eligibleFailures / eligibleCount : 0;

  const report = {
    rows: baseline.length,
    eligible: eligibleCount,
    eligible_parse_failures: eligibleFailures,
    eligible_parse_failure_rate: failureRate,
    failure_limit: FAILURE_LIMIT,
    accepted_reviews: reviews.length,
    required_changes: diffs.length,
    unreviewed_changes: missingReviews.length,
    stale_reviews: staleReviews.length,
    parser_exceptions: exceptions,
    // Independent labels detect unchanged wrong answers, unlike baseline diffs.
    // A partial label set must never be presented as full-corpus accuracy.
    index_validation: labelsPath
      ? {
          labeled_rows: labels.length,
          wrong_successful_indices: indexErrors.filter(
            (error) => error.kind === "wrong_successful_index"
          ).length,
          missed_indices: indexErrors.filter(
            (error) => error.kind === "missed_index"
          ).length,
          errors: indexErrors,
        }
      : null,
    input_sha256: {
      baseline: sha256File(baselinePath),
      eligibility: sha256File(eligibilityPath),
      reviewed_changes: sha256File(reviewsPath),
      ...(labelsPath ? { expected_indices: sha256File(labelsPath) } : {}),
    },
    dist_sha256: initialDistHash,
    dist_changed_during_check:
      sha256Directory(distDirectory) !== initialDistHash,
  };
  console.log(JSON.stringify(report, null, 2));

  if (
    exceptions ||
    indexErrors.length ||
    missingReviews.length ||
    staleReviews.length ||
    failureRate >= FAILURE_LIMIT ||
    report.dist_changed_during_check
  ) {
    if (missingReviews.length)
      console.error(`Unreviewed differences: ${missingReviews.length}`);
    if (staleReviews.length)
      console.error(`Stale or inexact reviews: ${staleReviews.length}`);
    if (failureRate >= FAILURE_LIMIT)
      console.error(
        `Eligible failure rate must be below ${FAILURE_LIMIT * 100}%`
      );
    if (exceptions) console.error(`Parser exceptions: ${exceptions}`);
    if (indexErrors.length)
      console.error(`Incorrect labeled indices: ${indexErrors.length}`);
    if (report.dist_changed_during_check)
      console.error("Package dist changed during this check");
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
