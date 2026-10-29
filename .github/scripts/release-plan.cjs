const fs = require("node:fs/promises");
const { execFileSync } = require("node:child_process");
const { check } = require("../../common/scripts/build-fingerprints.cjs");
const allowed = ["admin", "api-server", "data-server", "gateway"];

// A 404 is a missing image. Authentication, rate limits and network failures stop
// planning rather than cause unnecessary builds. GHCR write access is maintainer-only.
async function imageExists(name, fingerprint, request = fetch, variant = "") {
  const auth = await request(
    `https://ghcr.io/token?service=ghcr.io&scope=repository:${name}:pull`,
    { signal: AbortSignal.timeout(30000) }
  );
  if (!auth.ok)
    throw new Error(`Registry authorization failed: HTTP ${auth.status}`);
  const { token } = await auth.json();
  const response = await request(
    `https://ghcr.io/v2/${name}/manifests/fp-${fingerprint}${
      variant ? `-${variant}` : ""
    }`,
    {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          "application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json",
      },
      signal: AbortSignal.timeout(30000),
    }
  );
  if (response.status === 404) return false;
  if (!response.ok)
    throw new Error(`Registry lookup failed: HTTP ${response.status}`);
  return true;
}

async function planImages(owner, images, exists = imageExists) {
  const matrix = [],
    report = [];
  for (const { app, fingerprint, variant = "" } of images) {
    const name = `${owner.toLowerCase()}/lani-${app}`;
    const reused = await exists(name, fingerprint, undefined, variant);
    if (!reused)
      matrix.push({ app, fingerprint, ...(variant ? { variant } : {}) });
    report.push({
      app,
      image: `ghcr.io/${name}:fp-${fingerprint}${variant ? `-${variant}` : ""}`,
      action: reused ? "reuse" : "build",
    });
  }
  return { matrix, report };
}

function imageTargets(manifest, apps = allowed) {
  const images = [
    ...apps,
    ...(apps.some((app) => app !== "admin") ? ["db"] : []),
  ].map((app) => ({ app, fingerprint: manifest.images[app].fingerprint }));
  if (manifest.images["anime-matcher"]) {
    for (const variant of ["lexical", "semantic-cpu", "semantic-cu126"])
      images.push({
        app: "anime-matcher",
        fingerprint: manifest.images["anime-matcher"].fingerprint,
        variant,
      });
  }
  if (manifest.images["llm-matcher"])
    images.push({
      app: "llm-matcher",
      fingerprint: manifest.images["llm-matcher"].fingerprint,
    });
  return images;
}

function splitBuildMatrix(matrix) {
  return {
    matrix: matrix.filter(
      (x) => !["anime-matcher", "llm-matcher"].includes(x.app)
    ),
    matcherMatrix: matrix.filter((x) => x.app === "anime-matcher"),
    llmMatcherMatrix: matrix.filter((x) => x.app === "llm-matcher"),
  };
}

async function main() {
  if (process.argv[2] !== "select")
    throw new Error("Usage: release-plan.cjs select");
  const apps = allowed;
  const revision = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const { manifest } = check(revision);
  const images = imageTargets(manifest, apps);
  const { matrix, report } = await planImages(
    process.env.GITHUB_REPOSITORY.split("/")[0],
    images
  );
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `apps=${JSON.stringify(apps)}\nrevision=${revision}\n` +
      Object.entries(splitBuildMatrix(matrix))
        .map(([key, value]) => `${key}=${JSON.stringify(value)}\n`)
        .join("")
  );
  await fs.appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    "镜像计划（构建结果见对应 job）：\n```json\n" +
      JSON.stringify(report, null, 2) +
      "\n```\n"
  );
}
module.exports = { imageExists, planImages, imageTargets, splitBuildMatrix };
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
