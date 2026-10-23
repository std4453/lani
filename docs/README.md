# 文档站

文档站使用 Docusaurus 2，源码位于 `docs/`，静态资源位于 `static/`，发布地址为 <https://std4453.github.io/lani/>。

## 本地构建与预览

在仓库根目录使用 `.nvmrc` 指定的 Node.js 版本，并通过 Rush 安装锁定依赖：

```bash
nvm install
nvm use
node common/scripts/install-run-rush.js install --to @lani/docs
node common/scripts/install-run-rush.js build --to @lani/docs
```

产物位于 `docs/build/`。构建完成后，在仓库根目录启动静态预览：

```bash
cd docs
node ../common/scripts/install-run-rushx.js serve
```

开发时可在 `docs/` 下运行 `node ../common/scripts/install-run-rushx.js start`。文档站不需要启动 API、数据库或其他业务服务。

## GitHub Pages 发布

[Docs workflow](../.github/workflows/docs.yaml) 独立管理文档构建与发布：

- 目标为 `next` 的 PR 修改文档、此 workflow 或相关构建配置时，仅验证构建，不上传 Pages 发布产物、不取得发布权限。
- `next` 分支对应文件发生变更时，构建并发布 `docs/build/`。
- 手动触发必须选择 `next`；其他分支或标签会跳过构建与发布。没有可指定其他源码分支或 SHA 的输入。
- 构建 job 只有仓库读取权限；发布 job 使用 `github-pages` environment，仅授予 `pages: write` 和 `id-token: write`，不检出或执行仓库代码。
- 此 workflow 不构建应用镜像、不调用应用发布流水线或私有部署通知，不需要额外发布凭据。

首次启用需要仓库管理员完成：

1. 在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，替换旧的 `gh-pages` 分支发布方式。
2. 在 **Settings → Environments → github-pages** 中，将部署分支限制设为 **Selected branches and tags**，仅保留名为 `next` 的 **branch** 规则，移除旧的 `master`、`gh-pages` 和其他分支／标签规则；保留已有审批等保护设置。
3. 将 workflow 合入 `next` 后，由对应 push 自动构建发布。在 Pages 发布记录和 Docs workflow 中检查结果。

GitHub 要求手动触发的 workflow 同时存在于仓库默认分支。默认分支仍为 `master` 且没有此文件时，不能仅靠合入 `next` 获得手动入口；此时使用 `next` 的自动发布或重跑已有 Docs run。满足默认分支条件后，可执行：

```bash
gh workflow run docs.yaml --repo std4453/lani --ref next
```

该命令仅触发 Docs。不要用 `Default Pipeline` 或 `rushx devops` 发布文档，也不再使用本地 `docusaurus deploy` 推送 `gh-pages`。

自动 PR 和 `next` push 的变更全部位于 `docs/**` 或 `.github/workflows/docs.yaml` 时，应用发布与应用测试 workflow 只执行轻量的范围检查，跳过应用测试、应用镜像构建（包括 matcher）和部署通知；这些路径也不参与任何应用 fingerprint。manifest 校验及隔离规则回归测试仍运行。Docs 仅安装和构建 `@lani/docs`。

混合业务源码、共享锁文件或其他构建配置的变更不属于纯文档变更，仍执行应用流程。手动触发应用 workflow 是明确的应用操作，不受上述自动跳过规则影响。PR 标题或提交中的 `[skip-cd]` 仍可单独阻止自动 PR 应用部署通知，但对非纯文档的 `next` push 无效。修改隔离规则本身会改变共享构建输入，不能视作纯文档变更。完整规则见 [CI/CD 指南](docs/ci-cd.md)。
