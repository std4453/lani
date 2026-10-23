"use strict";

const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

// 文档源码和发布流程不属于应用镜像输入；共享配置仍走应用 CI。
function isDocsPath(file) {
  return file.startsWith("docs/") || file === ".github/workflows/docs.yaml";
}

function isDocsOnlyChange(eventName, event, cwd = process.cwd()) {
  let base, head, range;
  if (eventName === "pull_request") {
    base = event.pull_request?.base?.sha;
    head = event.pull_request?.head?.sha;
    range = "...";
  } else if (eventName === "push") {
    base = event.before;
    head = event.after;
    range = "..";
    // 新建或删除分支没有可比较的完整范围，保守保留应用流程。
    if (base === "0".repeat(40) || head === "0".repeat(40)) return false;
  } else {
    // 手动运行是明确的应用操作请求，不套用自动触发的文档跳过规则。
    return false;
  }
  if (![base, head].every((sha) => /^[a-f0-9]{40}$/.test(sha || "")))
    throw new Error("Expected complete base and head commit SHAs");

  // 完整 Git diff 避免远端文件列表截断；禁用重命名检测以检查旧、新两条路径。
  const files = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      `${base}${range}${head}`,
      "--",
    ],
    {
      cwd,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }
  )
    .split("\0")
    .filter(Boolean);
  return files.length > 0 && files.every(isDocsPath);
}

module.exports = { isDocsPath, isDocsOnlyChange };

if (require.main === module) {
  const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
  );
  const docsOnly = isDocsOnlyChange(process.env.GITHUB_EVENT_NAME, event);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `docs_only=${docsOnly}\n`);
  const message = docsOnly
    ? "Docs-only change: application builds, tests and deployment are skipped."
    : "Application changes or an explicit manual request: application CI is enabled.";
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY)
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
}
