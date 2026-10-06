# 仓库指南

## 开始工作前

先阅读本文件；启动本地服务前阅读 [开发指南](docs/docs/development.md)。如果当前分支存在 `CONTRIBUTING.md`，还应阅读其中的提交与分支规范。

### 私有补充与 Git worktree

本文件随 Git 分发；`.codex/` 是被忽略的本机补充，不随 clone 或 `git worktree add` 复制。忽略规则不限制文件读取，但文件必须实际存在，且当前执行环境有读取权限。

每次开始工作时，按以下顺序检查私有入口：

1. 用 `git rev-parse --show-toplevel` 确认当前工作区，再运行 `git worktree list --porcelain`。第一个记录是主工作区；使用其 `worktree` 字段给出的完整路径，不假定目录名、用户名或与当前工作区的相对位置。路径可能包含空格，传给命令时必须引用；程序解析可使用 `--porcelain -z`。
2. 如果主工作区与当前工作区不同，且不是 bare 仓库，检查并读取主工作区的 `.codex/PRIVATE_GUIDANCE.md`。
3. 检查并读取当前工作区的 `.codex/PRIVATE_GUIDANCE.md`。如果两个工作区相同，只读一次。私有入口中引用的相对文件路径按该入口所在目录解析；执行开发命令时仍应明确使用当前任务的工作区。
4. 私有补充只用于本机环境和维护者操作约束；公共开发规范以当前分支的本文件为准，不要改读主工作区旧分支的 `AGENTS.md` 来替代它。遇到冲突先辨明适用范围，不擅自放宽真实环境的操作限制。

普通克隆可能完全没有私有补充，仍可开展代码开发和测试。若入口或它引用的文件缺失、不可读，应如实说明，不能声称已读取；仅在任务依赖这些环境信息时暂停相关操作。不要为了读取说明复制凭据、链接整个 `.codex/`，或把主工作区配置直接套用到当前工作区。

私有补充及其引用的环境地址、本机路径、凭据、集群配置和运行状态，不得进入公开文档、提交或 PR。调整本机操作规则时应维护主工作区的私有入口及其引用文件，保留已有内容，避免仅改某个临时 worktree 的副本。

## 项目结构与架构

这是 Rush/pnpm 管理的 TypeScript monorepo：

- `apps/admin`：React/Umi 前端，通过 Gateway 访问 GraphQL。
- `apps/gateway`：统一鉴权和 Apollo Federation 入口，组合 `data`、`api` 两个 subgraph。
- `apps/data-server`：Koa + PostGraphile，将 PostgreSQL schema 暴露为 subgraph。
- `apps/api-server`：NestJS 业务 subgraph，负责下载、刮削、媒体库同步和通知等业务流程。
- `libs/db`：Prisma schema、client 生成和迁移；Prisma 与 PostGraphile 使用同一数据库结构。
- `libs/`：共享代码；`tools/cli`：构建、开发和 CI 工具；`docs/`：Docusaurus 文档。

代码、测试和配置应留在所属包内，不要手动修改生成文件。

## 构建、测试与开发

- `node common/scripts/install-run-rush.js install`：安装锁定的依赖图。
- `node common/scripts/install-run-rush.js build --to @lani/gateway`：按依赖顺序构建指定包；按改动范围替换目标包。
- `cd <project> && rushx lint`：运行该包的 ESLint（若提供）；API 包的 lint 带 `--fix`，运行后检查差异。
- `cd libs/parse-torrent-title && rushx test`：运行解析器 Jest 测试。
- `cd apps/api-server && rushx test`：运行 API Jest 测试；`No tests found` 不是测试通过。

新 clone/worktree 先运行 `node common/scripts/install-git-hooks.cjs`。提交前先暂存源码；pre-commit 会根据暂存区自动生成并暂存 `build-manifest.json`。不要手工编辑 fingerprint。手动补生成用 `node common/scripts/build-fingerprints.cjs generate --staged`；manifest 有未暂存修改或冲突时先处理，hook 不会覆盖。未安装 hook、`--no-verify`、rebase 后也必须保证最终提交通过 `manifest-check`。`next` 后续使用 squash/rebase 合入，禁止新增 merge commit 或改写发布历史。

修改依赖后执行 `rush update`，同步 `common/config/rush/pnpm-lock.yaml`。行为变更应增加 `*.test.ts` 或 `*.spec.ts` 回归测试并覆盖失败路径。按变更范围验证；仅文档变更检查链接、命令和差异即可。

不要运行 `start_tmux.sh`；按开发指南分别管理所需服务。API 开发模式仍可能写数据库、恢复下载任务和执行定时任务，启动前必须确认配置指向隔离的开发依赖。

## 下载匹配规则

配置下载匹配规则时，用实际资源标题验证 SQL `LIKE` pattern，核对同一季、同一集及解析出的 `episodeIndex`，确认 `剧集 index + offset = 资源 episodeIndex`，避免误匹配其他季度或合集。具体选源偏好由任务要求或私有补充提供。

## 风格、提交与分支

TypeScript 使用两个空格缩进。Prettier 要求分号、双引号、ES5 尾随逗号及箭头参数括号。组件和类使用 `PascalCase`，函数与 Hook 使用 `camelCase`，包目录使用小写 kebab-case。

提交主题和 PR 标题遵循 Conventional Commits：`<type>[(<scope>)][!]: <description>`。类型使用小写 `feat`、`fix`、`docs`、`refactor`、`perf`、`test`、`build`、`ci`、`style`、`chore` 或 `revert`；单包改动优先以包目录名作为 scope。不兼容变更使用 `!` 或 `BREAKING CHANGE:` 并说明迁移方式；自动生成的 merge commit 信息除外。

普通工作分支使用 `<type>/<description>`，Codex 工作分支使用 `codex/<type>-<description>`。description 使用小写英文字母、数字及单个连字符组成的 kebab-case。长期分支及已有分支无需重命名。除任务明确指定外，从最新的 `origin/next` 创建分支，PR 目标为 `next`。

提交前检查分支名、提交主题和 `git diff --cached`，确保只包含任务相关文件且没有隐私信息。PR 说明影响的包、验证命令及结果、配置或 Prisma 迁移；UI 变更附截图。

## CI/CD 与操作边界

本仓库维护应用代码及 GitHub Actions 工作流。Actions 构建并发布镜像后，调用独立私有部署仓库完成部署；部署模板、环境参数及访问凭据由维护者私下管理。普通代码开发与测试不应以拥有该私有仓库或维护者集群权限为前提。

`rushx devops` 会检查并可能推送 Git，随后触发 GitHub workflow，不能用作本地验证命令。未经用户明确授权，不执行 `git push`、workflow dispatch、部署、共享环境的数据库迁移、业务 mutation 或集群写操作。用户已明确要求提交 PR 时，可以完成该 PR 所需的分支推送和创建，不代表授权部署或合并。

涉及维护者环境时先读取可用的私有补充，默认从只读检查开始；不要输出 Secret、JWT、refresh token、kubeconfig 或带凭据的配置，也不要改动其他工作区或私有部署仓库中与当前任务无关的内容。
