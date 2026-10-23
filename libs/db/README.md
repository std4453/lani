# `@lani/db`

提供 Prisma schema、生成的客户端和数据库迁移。将本包加入依赖后，可按 `@prisma/client` 的方式导入；运行时模块从 `@lani/db/dist/runtime` 导入，schema 位于 `@lani/db/prisma/schema.prisma`。

客户端生成到 dist，使 Rush 部署能包含生成代码。在仓库中构建本包即可更新客户端。

部署后在包目录运行 `npm run migrate:deploy`，连接由 `DATABASE_URL` 指定，需使用具备结构修改权限的账号。对没有迁移历史的既有库，先备份并核对结构，确认初始迁移已实现后，用 `prisma migrate resolve --applied 20221002140138_init` 建立 baseline；不要重新执行初始化 SQL。

修改 schema 与开发迁移时阅读 [AGENTS.md](AGENTS.md)。普通平台部署见[用户手册](../../docs/docs/installation/deployment/index.mdx)。
