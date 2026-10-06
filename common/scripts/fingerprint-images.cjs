"use strict";
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { apps, sha256 } = require("./build-fingerprints.cjs");
const predicateType = "https://lani.dev/build/v1";
const signer = ".github/workflows/default_pipeline.yaml";
const accept =
  "application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json";
async function read(url, headers = {}) {
  const response = await fetch(url, {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024)
      throw new Error("Registry response exceeds limit");
    chunks.push(chunk);
  }
  return { status: response.status, body: Buffer.concat(chunks) };
}
function identity(repository, app, fingerprint) {
  if (
    !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository) ||
    !apps.includes(app) ||
    !/^[a-f0-9]{64}$/.test(fingerprint)
  )
    throw new Error("Invalid image identity");
  return `ghcr.io/${repository.split("/")[0].toLowerCase()}/lani-${app}`;
}
async function registry(repository, app, fingerprint, get = read) {
  const name = identity(repository, app, fingerprint);
  const imagePath = name.slice("ghcr.io/".length);
  const auth = await get(
    `https://ghcr.io/token?service=ghcr.io&scope=repository:${imagePath}:pull`
  );
  if (auth.status !== 200)
    throw new Error(`Registry authorization failed: HTTP ${auth.status}`);
  const token = JSON.parse(auth.body.toString()).token;
  if (typeof token !== "string")
    throw new Error("Registry returned no pull token");
  const headers = { Authorization: `Bearer ${token}`, Accept: accept };
  const raw = await get(
    `https://ghcr.io/v2/${imagePath}/manifests/fp-${fingerprint}`,
    headers
  );
  if (raw.status === 404) return null;
  if (raw.status !== 200)
    throw new Error(`Registry lookup failed: HTTP ${raw.status}`);
  return { image: `${name}@sha256:${sha256(raw.body)}`, name };
}
function verify(image, repository, app, fingerprint, execute = execFileSync) {
  const name = identity(repository, app, fingerprint);
  if (
    !image.startsWith(`${name}@sha256:`) ||
    !/^sha256:[a-f0-9]{64}$/.test(image.split("@")[1])
  )
    throw new Error("Unexpected image digest");
  const raw = execute(
    process.env.LANI_GH || "gh",
    [
      "attestation",
      "verify",
      `oci://${image}`,
      "--repo",
      repository,
      "--signer-workflow",
      `${repository}/${signer}`,
      "--source-ref",
      "refs/heads/next",
      "--deny-self-hosted-runners",
      "--predicate-type",
      predicateType,
      "--bundle-from-oci",
      "--format",
      "json",
    ],
    {
      encoding: "utf8",
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  const results = JSON.parse(raw);
  const found = results
    .map((r) => r.verificationResult?.statement)
    .find(
      (s) =>
        s?.predicateType === predicateType &&
        s.subject?.some(
          (subject) =>
            subject.name === name &&
            subject.digest?.sha256 === image.split("sha256:")[1]
        ) &&
        s.predicate?.version === 1 &&
        s.predicate.repository === repository &&
        s.predicate.app === app &&
        s.predicate.fingerprint === fingerprint &&
        /^[a-f0-9]{40}$/.test(s.predicate.buildSourceSha) &&
        /^[a-f0-9]{40}$/.test(s.predicate.workflowSha) &&
        /^[1-9][0-9]*$/.test(s.predicate.runId) &&
        /^[1-9][0-9]*$/.test(s.predicate.runAttempt)
    );
  if (!found) throw new Error("No matching trusted fingerprint provenance");
  return { image, ...found.predicate };
}
async function resolve(repository, app, fingerprint, get = read) {
  const found = await registry(repository, app, fingerprint, get);
  return found ? verify(found.image, repository, app, fingerprint) : null;
}
function buildResult(
  result,
  repository,
  app,
  fingerprint,
  revision,
  runId,
  runAttempt
) {
  const name = identity(repository, app, fingerprint);
  if (
    result?.version !== 1 ||
    result.repository !== repository ||
    result.project !== `@lani/${app}` ||
    result.revision !== revision ||
    !/^[a-f0-9]{40}$/.test(revision) ||
    result.runId !== runId ||
    result.runAttempt !== runAttempt ||
    typeof result.image !== "string" ||
    !result.image.startsWith(`${name}@sha256:`) ||
    !/^sha256:[a-f0-9]{64}$/.test(result.image.slice(name.length + 1))
  )
    throw new Error(
      "Build result does not match the planned image and execution"
    );
  return {
    image: result.image,
    name,
    digest: result.image.slice(name.length + 1),
  };
}
async function main() {
  const [command, app, fingerprint] = process.argv.slice(2);
  const repository = process.env.GITHUB_REPOSITORY;
  const name = identity(repository, app, fingerprint);
  const output = (values) =>
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(values)
        .map(([k, v]) => `${k}=${v}\n`)
        .join("")
    );
  if (command === "build-result") {
    output(
      buildResult(
        JSON.parse(fs.readFileSync("build-result/build-result.json", "utf8")),
        repository,
        app,
        fingerprint,
        process.env.SOURCE_SHA,
        process.env.GITHUB_RUN_ID,
        process.env.GITHUB_RUN_ATTEMPT
      )
    );
  } else if (command === "resolve") {
    const result = await resolve(repository, app, fingerprint);
    output({ image: result?.image || "", missing: !result, name });
  } else if (command === "predicate") {
    const revision = execFileSync(
      "git",
      ["-C", "source", "rev-parse", "HEAD"],
      { encoding: "utf8" }
    ).trim();
    const manifest = JSON.parse(
      fs.readFileSync("source/build-manifest.json", "utf8")
    );
    if (manifest.images[app]?.fingerprint !== fingerprint)
      throw new Error("Source fingerprint differs from input");
    fs.writeFileSync(
      "predicate.json",
      JSON.stringify({
        version: 1,
        repository,
        app,
        fingerprint,
        buildSourceSha: revision,
        workflowSha: process.env.GITHUB_SHA,
        runId: process.env.GITHUB_RUN_ID,
        runAttempt: process.env.GITHUB_RUN_ATTEMPT,
      })
    );
  } else if (command === "publish") {
    const image = process.env.BUILD_IMAGE;
    verify(image, repository, app, fingerprint);
    const existing = await resolve(repository, app, fingerprint);
    if (existing && existing.image !== image)
      throw new Error("Fingerprint already published with another digest");
    if (!existing)
      execFileSync(
        "docker",
        [
          "buildx",
          "imagetools",
          "create",
          "--prefer-index=false",
          "--tag",
          `${name}:fp-${fingerprint}`,
          image,
        ],
        { stdio: "inherit", timeout: 120000 }
      );
    const published = await resolve(repository, app, fingerprint);
    if (published?.image !== image)
      throw new Error("Fingerprint publication did not preserve the digest");
  } else if (command === "result") {
    const result = await resolve(repository, app, fingerprint);
    if (!result) throw new Error("Missing published image");
    fs.writeFileSync(
      `${app}.json`,
      JSON.stringify({ ...result, built: process.env.IMAGE_BUILT === "true" })
    );
  } else throw new Error("Unknown fingerprint image command");
}
module.exports = {
  registry,
  resolve,
  verify,
  predicateType,
  identity,
  buildResult,
};
if (require.main === module)
  main().catch(() => {
    console.error(
      "Fingerprint image operation failed; no unverified image may be reused"
    );
    process.exitCode = 1;
  });
