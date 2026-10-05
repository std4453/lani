const fs = require("node:fs/promises");
const { execFileSync } = require("node:child_process");
const allowed = ["admin", "api-server", "data-server", "gateway"];

function select(apps, legacy) {
  if (apps && legacy) throw new Error("Use apps or project_name, not both");
  const selected = (apps || legacy || "")
    .split(",")
    .map((name) => name.trim().replace(/^@lani\//, ""));
  if (
    !selected.length ||
    selected.some((app) => !allowed.includes(app)) ||
    new Set(selected).size !== selected.length
  ) {
    throw new Error(
      "Select unique application names: admin,api-server,data-server,gateway"
    );
  }
  return selected.sort();
}
async function main() {
  const apps = select(process.env.RELEASE_APPS, process.env.LEGACY_PROJECT);
  if (process.argv[2] === "select") {
    const revision = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `apps=${JSON.stringify(apps)}\nrevision=${revision}\nbackend=${apps.some(
        (app) => app !== "admin"
      )}\n`
    );
  } else throw new Error("Unknown release-plan command");
}
module.exports = { select };
if (require.main === module)
  main().catch(() => {
    console.error("Invalid release selection or build artifacts");
    process.exitCode = 1;
  });
