const fs = require("node:fs/promises");
const { execFileSync } = require("node:child_process");
const { check } = require("../../common/scripts/build-fingerprints.cjs");
const { resolve } = require("../../common/scripts/fingerprint-images.cjs");
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
async function planImages(repository, images, lookup = resolve) {
  const matrix = [];
  const reused = [];
  for (const { app, fingerprint } of images) {
    const image = await lookup(repository, app, fingerprint);
    if (image) reused.push({ ...image, built: false });
    else matrix.push({ app, fingerprint });
  }
  return { matrix, reused };
}

function assemble(images, matrix, reused, built) {
  const expected = new Map(
    images.map(({ app, fingerprint }) => [app, fingerprint])
  );
  const missing = new Set(matrix.map(({ app }) => app));
  const results = [...reused, ...built];
  const seen = new Set();
  for (const result of results) {
    if (
      !expected.has(result.app) ||
      seen.has(result.app) ||
      expected.get(result.app) !== result.fingerprint ||
      typeof result.built !== "boolean" ||
      result.built !== missing.has(result.app)
    )
      throw new Error("Invalid or duplicate fingerprint result");
    seen.add(result.app);
  }
  if (seen.size !== expected.size)
    throw new Error("Missing fingerprint result");
  return results.sort((a, b) => a.app.localeCompare(b.app));
}

async function main() {
  if (process.argv[2] === "select") {
    const apps = select(process.env.RELEASE_APPS, process.env.LEGACY_PROJECT);
    const revision = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    const { manifest } = check(revision);
    const imageApps = [
      ...apps,
      ...(apps.some((app) => app !== "admin") ? ["db"] : []),
    ];
    const images = imageApps.map((app) => ({
      app,
      fingerprint: manifest.images[app].fingerprint,
    }));
    const { matrix, reused } = await planImages(
      process.env.GITHUB_REPOSITORY,
      images
    );
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `images=${JSON.stringify(images)}\nreused=${JSON.stringify(
        reused
      )}\nmatrix=${JSON.stringify(matrix)}\napps=${JSON.stringify(
        apps
      )}\nrevision=${revision}\nbackend=${apps.some(
        (app) => app !== "admin"
      )}\n`
    );
  } else if (process.argv[2] === "assemble") {
    const images = JSON.parse(process.env.IMAGES);
    const matrix = JSON.parse(process.env.MATRIX);
    const reused = JSON.parse(process.env.REUSED);
    const built = [];
    if (matrix.length) {
      const files = (await fs.readdir("results")).sort();
      if (
        JSON.stringify(files) !==
        JSON.stringify(matrix.map(({ app }) => app + ".json").sort())
      )
        throw new Error("Missing or unexpected build result");
      for (const file of files)
        built.push(JSON.parse(await fs.readFile("results/" + file, "utf8")));
    }
    const results = assemble(images, matrix, reused, built);
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `built=${results.some((r) => r.built)}\n`
    );
    await fs.appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      "```json\n" + JSON.stringify(results, null, 2) + "\n```\n"
    );
  } else throw new Error("Unknown release-plan command");
}
module.exports = { select, planImages, assemble };
if (require.main === module)
  main().catch(() => {
    console.error("Invalid release selection or build artifacts");
    process.exitCode = 1;
  });
