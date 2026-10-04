# `@lani/db`

包含 prisma schema，用于执行 prisma 脚本，使用时等同于 `@prisma/client`。

## 使用

### 作为 `@prisma/client` 使用

直接将 `@lani/db` 添加为依赖即可。

`@lani/db` 会在 `rush build` 时在 `dist/` 下生成代码，解决原版 `@prisma/client` 在 `node_modules` 下生成代码、在 `rush deploy` 时不被包含的问题。

使用上 `@lani/db` 与 `@prisma/client` 等同，除了 `@prisma/runtime` 需要使用 `@lani/db/dist/runtime` 导入。

### 直接使用 prisma schema

将 `@lani/db` 添加为依赖后，通过 `node_modules/@lani/db/prisma/schema.prisma` 引用 prisma schema。

### 数据库 migration

`@lani/db` 也可以直接通过 `rush deploy` 部署，部署之后在包目录下运行 `npm run migrate:deploy` 会在 `DATABASE_URL` 指向的数据库中执行 migration。

下载源的匹配规则按 `(season_id, pattern)` 唯一，不同季度可以复用同一个 pattern，
同一季度仍不允许重复规则。对应 migration 在事务中创建联合唯一索引、删除原全局
唯一索引（兼容实际 UNIQUE 约束）并更新 PostGraphile Smart Comment，不修改已有记录，
也不改写历史 migration。构建时生成新的 Prisma Client，部署时执行
`npm run migrate:deploy`，并依次重启 data-server、gateway 以加载新的 GraphQL schema。
单条下载源查询由 `downloadSourceByPattern` 改为
`downloadSourceBySeasonIdAndPattern`；仓库内未使用的旧查询已移除。

迁移连接账号必须是相关表的 owner 或具备相应管理权限，仅有读写权限的应用账号
无法修改约束。对于没有 `_prisma_migrations` 的既有数据库，先备份并核对已有结构，
确认初始迁移已体现在数据库中后，运行
`prisma migrate resolve --applied 20221002140138_init` 建立 baseline，再执行 deploy；
不要在既有数据库上重新执行初始化 SQL。
迁移历史表 `_prisma_migrations` 通过 `@omit` 注释从 PostGraphile API 隐藏。

可在仓库根目录运行 `python3 libs/db/tests/download-source-migration.py` 验证旧库升级、
全新建库、数据保留、唯一约束及当前 enqueue SQL。该测试需要 Python 3 和 PATH 中的
`initdb`、`pg_ctl`、`psql`，以非 root 用户运行；它会创建并清理临时 PostgreSQL 实例，
不使用 `DATABASE_URL`。

> ⚠️ 警告
>
> 数据库相关操作均存在潜在的数据丢失风险，如果你是用户，请参考 [用户手册](https://std4453.github.io/lani/docs/category/%E9%83%A8%E7%BD%B2) 。如果你在开发 lani 项目，请在明确后果的前提下操作。

## 开发

开始开发前，你需要搭建一台 [PostgreSQL](https://www.postgresql.org/) 数据库，接着在包目录下创建 `.env` 文件，内容是：

```env
DATABASE_URL=postgres://{user}:{password}@{hostname}:{port}/{database-name}
```

你需要将数据库的用户名、密码等填入文件，可以参考 [StackOverflow](https://stackoverflow.com/questions/3582552/what-is-the-format-for-the-postgresql-connection-string-url)。这个文件不会被提交到 git。

在开发过程中，会在数据库中创建、修改表，需要授予上述用户对应的权限。此外，开发 migration 的时候，会创建 shadow database，需要授予创建数据库权限，具体请参考 [prisma 文档](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions)。

数据库 schema 位于 [`prisma/schema.prisma`](prisma/schema.prisma)，推荐的方式是直接在 schema 上修改，然后 `rushx prisma:push` 将变更 push 到开发用的数据库。

另一种方法是直接在数据库上变更，然后运行 `rushx prisma:pull` 将更改同步到 schema 文件。这种方法有时会破坏 schema 文件的格式，建议在同步后将受影响的部分恢复原状。

修改时，你需要注意命名。在 lani 项目中，我们要求数据库类型、表和字段使用 `snake_case` 命名，而 prisma 中的名称会直接转换为 TypeScript 类型，因此应当使用 `PascalCase` （表和类型）或 `camelCase` （字段）。枚举值总是使用 `MACRO_CASE`。

> ⚠️ 警告
>
> 除非必要，**请勿删除现有字段**。如果某个字段再也不会用到了，将它设置为 Nullable，或提供一个默认值。

> ℹ️ 提示
>
> prisma 支持多种数据库，对 PostgreSQL 的功能支持**不是很好**，如果需要使用
> prisma 不支持的数据库功能，请务必确认版本兼容性和对插件的需求，并在创建 migration
> 时小心地加入对应的 SQL 语句。

修改后，构建 `@lani/db`，即可完成 prisma client 生成。

---

完成开发和测试后，版本发布 / 提交 PR 之前，需要创建 migration。

根据 prisma 的设计，开发阶段使用的数据库和 migration 开发阶段用的不同，migration 中用的数据库只能使用 migration 进行变更，否则需要重置整个数据库。

尽管 [也有方法可以绕过](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/troubleshooting-development)，推荐的方法是创建第二个数据库用于开发 migration。

运行 `rushx migrate:create` 创建一个新的 migration（请根据变更内容命名，如 `add_users_table`）。

创建之后，请人工审阅 migration 代码，必要时做出修改。由于 prisma migrate 功能限制，有部分常用功能需要手动修改，这包括：

- 数据库注释：`postgraphile` 使用 [Smart Comment](https://www.graphile.org/postgraphile/smart-comments/) 机制控制其功能，但 [prisma 并不支持数据库注释](https://github.com/prisma/prisma/issues/8896)。因此，一切用到 Smart Comment 的功能（如 `@omit`）都需要手动加入 migration 中。
- unique：`postgraphile` 基于 unique constraint 识别 unique，影响 query 和 mutation 的创建，然而 prisma migrate 只创建 unique index，不创建 unique contraint。因此，需要在用到 unique 的表上添加 [`@unique` Smart Comment](https://www.graphile.org/postgraphile/smart-tags/#unique)。

最后，运行 `rushx migrate:apply` 将完成的 migration 提交到数据库，之后再次创建 migration 时均会以这次提交的为准。

## Kubernetes 发布迁移

迁移镜像包含锁定版本的 Prisma CLI、运行引擎和完整迁移文件，默认执行
`npm run migrate:deploy`（即 `prisma migrate deploy`）。包含任意后端应用的
release 都先关闭入口、停止相关后端并确认旧 Pod 退出，再在集群内运行一次迁移
Job；即使没有新增或待执行的 migration，也会经历维护窗口，由 Prisma 处理空操作。
Job 成功后才部署选中的应用并按依赖顺序恢复服务。纯 Admin 发布不构建 db 镜像，
也不执行迁移或停止后端。

数据库连接通过集群 Secret 注入，Actions 不获取连接串。发布工具不自行解析迁移
历史或比较 SQL checksum，不调用 `migrate status`，也不在生产发布中生成 migration、
reset、baseline 或 resolve。迁移失败、超时或结果不明时保留锁和现场，交由人工接管。

完整入口及接入要求见[迁移与持续部署指南](../../docs/docs/installation/deployment/migration-cd.mdx)。
