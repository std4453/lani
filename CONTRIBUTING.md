# 提交与分支指南

本指南适用于本仓库新建的工作分支、提交和 PR。现有历史提交及分支无需为此重写或重命名。

## 提交规范

手工创建的提交必须遵循 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)。本仓库约定如下：

```text
<type>[(<scope>)][!]: <description>

[正文]

[页脚]
```

方括号表示可选部分，不应写入实际提交信息。冒号后保留一个空格。

`type` 使用下表中的小写值；分支的类型也从同一张表选择。

| 类型 | 用途 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `docs` | 文档变更 |
| `refactor` | 不改变外部行为的代码重构 |
| `perf` | 性能改进 |
| `test` | 测试新增或调整 |
| `build` | 构建系统或依赖变更 |
| `ci` | 持续集成、自动化流水线变更 |
| `style` | 不影响语义的格式调整 |
| `chore` | 其他维护工作 |
| `revert` | 撤销已有提交 |

- `scope` 可省略；涉及单个包时优先填写包目录名，例如 `admin`、`api-server`、`gateway`、`data-server`、`all-in-one`、`db`、`framework`、`parse-torrent-title`、`cli` 或 `docs`。跨包变更可省略 scope。
- `description` 用中文或英文简洁说明具体改动，避免 `update`、`fix bug` 等无法说明内容的标题。
- 不兼容变更必须使用 `!` 或 `BREAKING CHANGE:` 标记，并说明影响和迁移方式；本仓库推荐同时使用两者。
- 正文和页脚各自与前一部分空一行。撤销提交使用 `revert` 类型，并在正文或页脚注明被撤销的提交 SHA。
- 一个提交围绕一个明确目的组织；Git/GitHub 自动生成的 merge commit 信息不受上述格式限制。

示例（不代表实际变更）：

```text
feat(admin): 添加季度筛选
fix(api-server): 修复下载路径拼接
docs: 补充提交与分支规范
ci: 调整构建缓存
```

不兼容变更示例：

```text
feat(api-server)!: 移除旧版下载接口

统一使用新版下载接口，避免维护两套协议。

BREAKING CHANGE: 删除旧版下载接口，调用方需迁移到新版接口。
```

## 分支命名

普通工作分支使用 `<type>/<description>`；Codex 创建的工作分支使用 `codex/<type>-<description>`。

- `type` 使用上表中的类型，反映分支的主要目的。
- `description` 使用小写英文字母、数字和单个连字符组成的 kebab-case；以字母或数字开头、结尾，不使用空格、下划线、中文或额外的 `/`。
- 描述应说明具体任务，可加入包名或 issue 编号，例如 `fix/123-api-download-path`。
- `master`、`next` 是长期分支，不适用工作分支格式。新工作默认从最新的 `origin/next` 创建，并向 `next` 提交 PR；如任务明确指定其他目标，则以该目标为准。

有效示例：

```text
feat/admin-season-filter
fix/api-download-path
docs/commit-branch-guide
codex/docs-commit-branch-guide
codex/fix-db-download-source
```

`feature/foo`（类型不在表中）、`fix/Download_Path`（大小写及下划线）、`codex/update`（缺少类型）不符合本仓库约定。

创建分支前确认工作区状态，再执行：

```bash
git fetch origin
git switch -c docs/commit-branch-guide origin/next
# Codex 工作分支改用 codex/docs-commit-branch-guide
```

## PR 与提交前检查

- PR 标题遵循与提交相同的 Conventional Commits 格式；使用 squash merge 时，最终提交信息也必须符合规范。
- PR 描述应说明改动目的、影响的包、验证命令及结果；涉及配置或 Prisma 迁移时说明操作要求，UI 变更附截图。
- 检查分支名、提交信息及 PR 目标分支，执行 `git diff --check`，并运行与改动相关的测试或构建。仅文档变更无需运行应用测试。
- 通过 `git diff --cached` 确认提交内容，不提交凭据、本机私有指南或生成的私有上下文。

## 构建 manifest 与提交 hook

新 clone/worktree 运行 `node common/scripts/install-git-hooks.cjs`；安装使用 worktree 独立配置，不改变其他工作树的 hook。已有自定义 hook 时安装命令会拒绝覆盖，请手动整合。

先 `git add` 本次源码，再提交。pre-commit 只从暂存区生成和暂存 `build-manifest.json`，不包含未暂存源码，不改变其他路径的部分暂存。请勿手工修改 fingerprint；manifest 自身有未暂存修改或冲突时提交会阻断。

需要手动生成时运行：

```bash
node common/scripts/build-fingerprints.cjs generate --staged
node common/scripts/build-fingerprints.cjs check --ref "$(git rev-parse HEAD)"
node common/scripts/build-fingerprints.cjs explain --ref "$(git rev-parse HEAD)" --app admin
```

`check` 校验指定完整提交；工作区尚未提交的 manifest 可用下一次提交的 CI 校验。CI 不自动提交修复。

`next` 新提交要求线性历史，使用 squash/rebase 合入。合入前更新到最新基线并通过 `manifest-check`；rebase 或绕过 hook 不免除校验。已有历史不重写。分支保护须在该检查首次运行成功后启用；本文件不表示远端设置已经生效。

fingerprint 覆盖应用及依赖的 Git 构建输入。相同输入复用 `fp-<fingerprint>` 镜像；更新外部基础镜像等输入时，修改对应 Dockerfile/构建配置形成新的 fingerprint，不覆盖已有 fingerprint 标签。

其余提交规范继续通过自查和 PR 审查执行；没有新增 commitlint 或分支命名检查。
