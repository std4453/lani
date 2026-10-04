const fs = require("node:fs/promises");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const allowed = ["admin", "api-server", "data-server", "gateway"];
const digest = /^[a-z0-9][a-z0-9._:/-]*@sha256:[a-f0-9]{64}$/;

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
function assemble(apps, revision, results) {
  if (!/^[a-f0-9]{40}$/.test(revision))
    throw new Error("Expected an immutable source commit");
  const expected = [
    ...apps,
    ...(apps.some((app) => app !== "admin") ? ["db"] : []),
  ];
  const images = {};
  for (const result of results) {
    const app = result.project?.replace(/^@lani\//, "");
    if (
      !expected.includes(app) ||
      images[app] ||
      result.revision !== revision ||
      !digest.test(result.image)
    ) {
      throw new Error(
        "Unexpected, duplicate, mixed-revision or non-digest build artifact"
      );
    }
    images[app] = result.image;
  }
  if (Object.keys(images).length !== expected.length)
    throw new Error("Missing release artifacts");
  return {
    version: 1,
    revision,
    applications: Object.fromEntries(apps.map((app) => [app, images[app]])),
    ...(images.db ? { migration: { image: images.db, revision } } : {}),
  };
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
  } else if (process.argv[2] === "assemble") {
    const files = [];
    async function visit(directory) {
      for (const item of await fs.readdir(directory, { withFileTypes: true })) {
        const filename = path.join(directory, item.name);
        if (item.isDirectory()) await visit(filename);
        else if (item.name === "build-result.json")
          files.push(JSON.parse(await fs.readFile(filename, "utf8")));
        else throw new Error("Unexpected release artifact file");
      }
    }
    await visit("release-artifacts");
    const plan = assemble(apps, process.env.SOURCE_REVISION, files);
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `plan=${JSON.stringify(plan)}\n`
    );
  } else throw new Error("Unknown release-plan command");
}
module.exports = { select, assemble };
if (require.main === module)
  main().catch(() => {
    console.error("Invalid release selection or build artifacts");
    process.exitCode = 1;
  });
