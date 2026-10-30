"use strict";

const ignore = require("./vendor/ignore");

// 两层规则都以仓库根目录为基准；镜像专属规则追加在公共规则之后。
function fingerprintIgnore(tree, app) {
  const matcher = ignore({ ignoreCase: false });
  for (const file of [
    ".fingerprintignore",
    `common/config/fingerprints/${app}.ignore`,
  ]) {
    if (!tree.entries.has(file)) continue;
    tree
      .read(file)
      .split(/\r?\n/)
      .forEach((pattern, index) => {
        matcher.add({ pattern, mark: `${file}:${index + 1}` });
      });
  }
  return (file) => {
    const result = matcher.checkIgnore(file);
    return result.ignored
      ? { source: result.rule.mark, pattern: result.rule.pattern }
      : undefined;
  };
}

module.exports = { fingerprintIgnore };
