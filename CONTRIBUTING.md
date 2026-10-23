# 贡献指南

修改前阅读 [AGENTS.md](AGENTS.md) 中的代码与文档规范，按[本地开发说明](development/local-development.md)准备环境。普通开发和测试使用自己隔离的依赖；只编写用户手册时，按[文档站贡献说明](docs/CONTRIBUTING.md)构建即可。

## 分支与提交

从最新 `origin/next` 创建 `<type>/<description>` 工作分支，向 `next` 提交 PR。description 使用小写英文字母、数字及单个连字符，例如 `fix/api-download-path`。已有分支无需重命名。

```bash
git fetch origin
git switch -c docs/documentation-layout origin/next
```

提交主题及 PR 标题遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)：

```text
<type>[(<scope>)][!]: <description>
```

类型使用 `feat`、`fix`、`docs`、`refactor`、`perf`、`test`、`build`、`ci`、`style`、`chore` 或 `revert`。单包改动优先以包目录名作为 scope，描述优先使用简体中文，例如 `fix(api-server): 修复下载路径拼接`。不兼容变更使用 `!` 或 `BREAKING CHANGE:` 并说明迁移方式；正文和页脚各空一行。撤销提交在正文或页脚记录原 SHA。自动生成的 merge commit 信息沿用 Git 格式。

## 提交与检查

一个提交围绕一个明确目的组织。先运行改动相关的验证，再暂存文件并检查 `git diff --cached`，确认范围、凭据和私有信息。文档变更检查链接、命令及 `git diff --check`；行为变更的回归要求见 [AGENTS.md](AGENTS.md#构建测试与开发)。

正常 `rush install` 会安装 `common/git-hooks/pre-commit` 和 `pre-push`。pre-commit 按暂存区生成并暂存 `build-manifest.json`，保持其他文件的部分暂存；manifest 存在人工未暂存修改或冲突时会停止。跳过 hook 或同步分支后，使用下列命令生成、检查：

```bash
node common/scripts/build-fingerprints.cjs generate --staged
node common/scripts/build-fingerprints.cjs check --ref "$(git rev-parse HEAD)"
node common/scripts/build-fingerprints.cjs explain --ref "$(git rev-parse HEAD)" --app admin
```

pre-push 拦截以 `codex/` 开头的源分支或目标分支，允许删除该前缀的旧远端分支。已有个人 hooks 时先备份并整合：自定义 pre-commit 调用 `generate --staged`；自定义 pre-push 调用 `sh common/git-hooks/pre-push "$@"`，传递原始标准输入和退出状态，多个检查读取输入时先保存再分别传入。自定义 `core.hooksPath` 的安装使用 `--bypass-policy`，避免 Rush 覆盖个人 hooks。

linked worktree 默认共享 hooks，脚本从当前工作树执行。确需独立配置时，在已开启 `extensions.worktreeConfig` 的仓库使用 `git config --worktree core.hooksPath common/git-hooks`。其余命名规范通过自查和 PR 审查执行。

## PR 与 CI

PR 说明目的、影响的包、验证命令及结果；涉及配置或 Prisma migration 时说明操作要求，UI 变更附截图。单个 PR 的数据库变更须符合 [migration 合并规则](AGENTS.md#数据库-migration)。

CI 的使用顺序如下：

1. 检查 manifest 一致性及受影响的构建、测试结果。`[skip-cd]` 不跳过测试或镜像构建。
2. 同仓库、目标为 `next` 的 PR 通常会在构建成功后通知测试部署。文档整理等无需部署的 PR，在标题加入 `[skip-cd]`；它持续阻止自动 PR 部署通知，直到移除。修改标题本身不触发发布，手动 dispatch 会忽略此标记。
3. 失败后按原因修复；需要重跑发布流程时选择 **Re-run all jobs**，由流水线重新规划并复用已完成镜像。构建或通知成功后，还需查看部署结果。
4. 合入前与最新 `origin/next` 同步并通过检查。工作分支可 merge 或 rebase 同步，最终使用 squash/rebase merge 保持 `next` 的线性历史，保留已发布历史。

仅当完整变更范围非空且全部位于 `docs/**` 或 `.github/workflows/docs.yaml` 时，自动 PR/push 才跳过应用构建、测试和部署通知；manifest 与隔离规则检查仍运行。根目录和包内文档不属于此范围。`next` push 的应用部署通知不受 `[skip-cd]` 影响。

完整事件、权限、手动入口及镜像构建约束见 [CI/CD 说明](development/ci-cd.md)。文档站独立通过 GitHub Pages 发布，操作见[文档站贡献说明](docs/CONTRIBUTING.md)。
