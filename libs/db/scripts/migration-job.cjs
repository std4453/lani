const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");
const { inspectDatabase } = require("./migration-history.cjs");

async function main() {
  const mode = process.argv[2];
  if (!["check", "deploy"].includes(mode))
    throw new Error("Invalid migration Job mode");
  const before = await inspectDatabase();
  if (mode === "check") return before;
  // Recheck after downtime: an external restore or migration cannot silently
  // change the plan that was approved by the locked preflight check.
  if (
    before.status !== "pending" ||
    before.historyHash !== process.env.EXPECTED_HISTORY_HASH ||
    before.sourceHash !== process.env.EXPECTED_SOURCE_HASH
  )
    throw new Error("Migration history changed after preflight");
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
      {
        stdio: ["ignore", "inherit", "inherit"],
        shell: false,
      }
    );
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("Migration failed"))
    );
  });
  const after = await inspectDatabase();
  if (after.status !== "current" || after.sourceHash !== before.sourceHash)
    throw new Error("Post-migration history is not current");
  return after;
}

// Only this JSON contract is consumed by deployment tooling. CLI logs/exit 0
// from Prisma 3.15.2 migrate status are deliberately not used as a status API.
main()
  .then(async (result) => {
    const message = JSON.stringify(result);
    // Kubernetes termination messages have a 4096-byte limit; fail rather than truncate.
    if (Buffer.byteLength(message) > 3900)
      throw new Error("Migration result too large");
    await fs.writeFile("/dev/termination-log", message);
    console.log(`Migration ${process.argv[2]}: ${result.status}`);
  })
  .catch(async () => {
    await fs
      .writeFile(
        "/dev/termination-log",
        JSON.stringify({ version: 1, status: "error" })
      )
      .catch(() => {});
    console.error(
      "Migration inspection/execution failed; inspect private Job evidence and database history"
    );
    process.exitCode = 1;
  });
