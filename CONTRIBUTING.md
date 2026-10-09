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

- 向 `next` 合入要求分支 **up to date**，目标分支保持 **linear history**。这不等于强制使用 rebase 同步工作分支：可以 merge `origin/next` 或 rebase 到最新 next，再更新 manifest 并通过检查；最终以 squash/rebase merge 合入，保持 next 历史线性，不改写已发布历史。
- PR 标题遵循与提交相同的 Conventional Commits 格式；使用 squash merge 时，最终提交信息也必须符合规范。
- PR 描述应说明改动目的、影响的包、验证命令及结果；涉及配置或 Prisma 迁移时说明操作要求，UI 变更附截图。
- 检查分支名、提交信息及 PR 目标分支，执行 `git diff --check`，并运行与改动相关的测试或构建。仅文档变更无需运行应用测试。
- 通过 `git diff --cached` 确认提交内容，不提交凭据、本机私有指南或生成的私有上下文。

## PR 测试部署

自动测试部署与 `[skip-cd]` 规则见 [.github/README.md](.github/README.md)。

## 构建 manifest 与提交 hook

执行正常依赖安装 `node common/scripts/install-run-rush.js install` 时，Rush 会把 `common/git-hooks/pre-commit` 安装到 Git hooks 目录，不需要另装 hook 管理器。Git clone 本身不会执行安装。

Rush 5.58 会重建默认 hooks 目录；已有个人 hook 的维护者请先自行备份、整合。如果使用自定义 `core.hooksPath`，在现有 pre-commit 中调用 `node common/scripts/build-fingerprints.cjs generate --staged`，安装依赖时使用 `--bypass-policy` 跳过 Rush hook 安装。linked worktree 默认共享 Git hooks；仓库 hook 从当前工作树执行，旧分支没有生成器时跳过。需要独立配置时，可自行使用 `git config --worktree core.hooksPath common/git-hooks`（要求已开启 `extensions.worktreeConfig`）。

先暂存本次源码再提交。hook 只生成并暂存 `build-manifest.json`，不改变其他文件的部分暂存；manifest 有人工未暂存修改或冲突时会报错，不覆盖内容。

```bash
node common/scripts/build-fingerprints.cjs generate --staged
node common/scripts/build-fingerprints.cjs check --ref "$(git rev-parse HEAD)"
node common/scripts/build-fingerprints.cjs explain --ref "$(git rev-parse HEAD)" --app admin
```

`manifest-check` 是 PR 的轻量一致性检查，用于发现忘记生成、跳过 hook 和 rebase 后的过期数据。CI 不自动提交修复。`next` 采用 squash/rebase 合入，避免改写已发布历史；维护者可在 GitHub 设置中将该检查设为必需检查，不需要额外运维脚本。

fingerprint 包含应用、Rush 本地依赖和部署包含关系、锁文件、构建脚本及配置；显式排除文档和 hook。跨项目源码输入（包括符号链接的目标）必须在依赖关系中声明，不能从未声明的项目偷偷读取文件。修改依赖或构建方式时用 `explain` 核对输入范围。

主流水线排队执行；仅缺失的 `fp-<fingerprint>` 镜像进入原有构建流程。镜像使用标准 OCI labels 记录实际构建 SHA、fingerprint 和 run/attempt。GHCR 写权限只给维护者和受信的构建流程；这些标签用于追溯，不是加密签名证明。

不要手动覆盖 fingerprint 标签；需要刷新基础镜像等外部输入时，修改 Dockerfile/构建配置产生新 fingerprint。失败后使用 **Re-run all jobs** 重新规划，避免仅重跑旧构建 job 覆盖已有标签。所需镜像全部可用后会通知部署，包括全部复用的情况；实际部署范围由目标 manifest 与环境成功基线决定。

其余提交规范通过自查和 PR 审查执行，不新增 commitlint 或分支命名检查。
