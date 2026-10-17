# Lani

Lani 是用于媒体库管理、资源下载和元数据同步的 TypeScript monorepo，使用 Rush/pnpm 管理依赖。

## 项目结构

- `apps/admin`：React/Umi 管理界面。
- `apps/gateway`：鉴权与 Apollo Federation GraphQL 入口。
- `apps/api-server`：NestJS 业务服务。
- `apps/data-server`：基于 PostgreSQL/PostGraphile 的数据服务。
- `libs/db`：Prisma schema、client 和数据库迁移。
- `libs/`、`tools/cli`、`docs/`：共享代码、开发工具和文档站。

## 开发

使用 Node.js 22（最低 22.21.1；`.nvmrc` 固定为 22.23.2）。在仓库根目录安装依赖并构建：

```bash
nvm install && nvm use
node common/scripts/install-run-rush.js install
node common/scripts/install-run-rush.js build --to @lani/gateway
```

配置隔离的开发依赖、启动各服务及执行测试的完整步骤见[开发指南](../docs/docs/development.md)。提交和分支约定见[贡献指南](../CONTRIBUTING.md)，仓库协作规范见 [AGENTS.md](../AGENTS.md)。

镜像构建、CI 检查及发布流程见 [CI/CD 指南](../docs/docs/ci-cd.md)。
