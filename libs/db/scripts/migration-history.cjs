const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const digest = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

async function readMigrations(root) {
  const lock = await fs.readFile(
    path.join(root, "migration_lock.toml"),
    "utf8"
  );
  if (!/^provider\s*=\s*"postgresql"\s*$/m.test(lock))
    throw new Error("Unsupported migration provider");
  const entries = await fs.readdir(root, { withFileTypes: true });
  const migrations = [];
  for (const entry of entries.sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  )) {
    if (entry.name === "migration_lock.toml" && entry.isFile()) continue;
    if (!entry.isDirectory() || !/^[0-9]{14}_[a-zA-Z0-9_-]+$/.test(entry.name))
      throw new Error("Unexpected migration file");
    const content = await fs.readFile(
      path.join(root, entry.name, "migration.sql")
    );
    migrations.push({ name: entry.name, checksum: digest(content) });
  }
  if (!migrations.length)
    throw new Error("Empty migration history requires manual review");
  return migrations;
}

// Fail closed. A valid database history must be a checksum-matching prefix of
// the image's full history. A table restored from an older backup is pending,
// regardless of whether this Git revision introduced new migration files.
function compareHistory(migrations, rows) {
  if (!Array.isArray(rows) || rows.length === 0)
    throw new Error("Invalid migration history response");
  const byName = new Map(
    migrations.map((migration) => [migration.name, migration])
  );
  const applied = new Map();
  const date = (value) =>
    value && (value instanceof Date || typeof value === "string")
      ? new Date(value).getTime()
      : NaN;
  const ids = new Set();
  for (const row of rows) {
    if (
      typeof row.id !== "string" ||
      !row.id ||
      ids.has(row.id) ||
      !byName.has(row.migration_name) ||
      !/^[a-f0-9]{64}$/.test(row.checksum) ||
      !Number.isFinite(date(row.started_at)) ||
      (row.finished_at &&
        (!Number.isFinite(date(row.finished_at)) ||
          date(row.finished_at) < date(row.started_at))) ||
      (row.rolled_back_at &&
        (!Number.isFinite(date(row.rolled_back_at)) ||
          date(row.rolled_back_at) < date(row.started_at))) ||
      (row.finished_at && row.rolled_back_at)
    )
      throw new Error("Invalid or divergent history");
    ids.add(row.id);
    if (row.rolled_back_at) continue; // An explicitly resolved failed attempt is not applied.
    if (!row.finished_at)
      throw new Error("Unresolved failed or active migration");
    if (
      applied.has(row.migration_name) ||
      row.checksum !== byName.get(row.migration_name).checksum
    ) {
      throw new Error("Duplicate or modified applied migration");
    }
    applied.set(row.migration_name, date(row.started_at));
  }
  const pending = [];
  let previousStart = -Infinity;
  for (const migration of migrations) {
    if (!applied.has(migration.name)) pending.push(migration.name);
    else {
      if (pending.length || applied.get(migration.name) < previousStart)
        throw new Error(
          "Database history has a gap or invalid application order"
        );
      previousStart = applied.get(migration.name);
    }
  }
  const normalized = rows
    .map((row) => ({
      id: row.id,
      name: row.migration_name,
      checksum: row.checksum,
      started: row.started_at,
      finished: row.finished_at,
      rolledBack: row.rolled_back_at,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return {
    version: 1,
    status: pending.length ? "pending" : "current",
    pending,
    sourceHash: digest(JSON.stringify(migrations)),
    historyHash: digest(JSON.stringify(normalized)),
  };
}

async function inspectDatabase() {
  const migrations = await readMigrations(
    path.join(__dirname, "../prisma/migrations")
  );
  const { PrismaClient } = require("../dist");
  const url = new URL(process.env.DATABASE_URL);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("Unsupported database");
  const schema = url.searchParams.get("schema") || "public";
  const identifier = '"' + schema.replace(/"/g, '""') + '"';
  const prisma = new PrismaClient({
    log: [],
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
  try {
    // Prisma 3 supports sequential batch transactions without interactive preview flags.
    // Missing table, bad credentials, SQL errors, etc. throw; none mean "current".
    const [, rows] = await prisma.$transaction([
      prisma.$executeRawUnsafe(
        "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY"
      ),
      prisma.$queryRawUnsafe(
        `SELECT id, checksum, migration_name, started_at, finished_at, rolled_back_at FROM ${identifier}."_prisma_migrations" ORDER BY started_at, id`
      ),
    ]);
    return compareHistory(migrations, rows);
  } finally {
    await prisma.$disconnect();
  }
}
module.exports = { compareHistory, readMigrations, inspectDatabase };
