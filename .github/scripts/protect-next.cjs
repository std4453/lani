"use strict";
// Explicit operator command, never part of the build/notification jobs.
const { execFileSync } = require("node:child_process");
const { check } = require("../../common/scripts/build-fingerprints.cjs");
const gh = (args, input) =>
  JSON.parse(
    execFileSync("gh", args, {
      input,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    })
  );
try {
  const mode = process.argv[2];
  if (!["--preview", "--apply"].includes(mode) || process.argv.length !== 3)
    throw new Error("Use --preview or --apply");
  const repository = gh([
    "repo",
    "view",
    "--json",
    "nameWithOwner",
  ]).nameWithOwner;
  if (repository !== "std4453/lani") throw new Error("Unexpected repository");
  const head = gh(["api", `repos/${repository}/commits/next`]).sha;
  check(head); // Fetch origin/next before use; never protect an unchecked remote tree.
  const checks = gh([
    "api",
    `repos/${repository}/commits/${head}/check-runs`,
    "--paginate",
    "--slurp",
  ])
    .flatMap((page) => page.check_runs)
    .filter(
      (c) =>
        c.name === "manifest-check" &&
        c.status === "completed" &&
        c.conclusion === "success" &&
        c.app?.slug === "github-actions"
    );
  if (!checks.length)
    throw new Error(
      "The manifest-check must succeed on the current next head before protection can be enabled"
    );
  const body = {
    required_status_checks: {
      strict: true,
      checks: [{ context: "manifest-check", app_id: checks[0].app.id }],
    },
    enforce_admins: true,
    required_pull_request_reviews: { required_approving_review_count: 0 },
    restrictions: null,
    required_linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false,
  };
  console.log(
    JSON.stringify(
      { repository, branch: "next", head, protection: body },
      null,
      2
    )
  );
  if (mode === "--apply") {
    // Refuse to replace a protection someone installed after this plan was prepared.
    try {
      gh(["api", `repos/${repository}/branches/next/protection`]);
      throw new Error("Existing next protection must be reconciled manually");
    } catch (error) {
      if (
        !String(error.stderr || "").includes('"status":"404"') &&
        !String(error.stderr || "").includes("HTTP 404")
      )
        throw error;
    }
    gh(
      [
        "api",
        "--method",
        "PUT",
        `repos/${repository}/branches/next/protection`,
        "--input",
        "-",
      ],
      JSON.stringify(body)
    );
    console.log("Enabled next protection; master was not changed");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
