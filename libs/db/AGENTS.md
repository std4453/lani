# 数据库开发

使用隔离 PostgreSQL，在本包被忽略的 `.env` 中设置 `DATABASE_URL`。以 Prisma schema 为模型来源，修改后构建本包生成客户端；`prisma:push` 仅用于可重建的开发库。开发 migration 使用另一份只通过迁移演进的数据库，所需 shadow database 权限限于开发账号。

数据库对象使用 snake_case，Prisma 模型与类型使用 PascalCase、字段使用 camelCase，枚举值使用 MACRO_CASE。字段移除需同时评估存量数据与调用方，必要时先保留可空字段或默认值完成过渡。

使用 `rushx migrate:create` 生成候选 SQL，人工核对后用 `rushx migrate:apply` 验证。单个 PR 必须遵循根目录的[migration 合并规则](../../AGENTS.md#数据库-migration)，从目标分支基线直接到最终状态，验证旧库升级及新库安装。

Prisma 无法表达全部 PostgreSQL/PostGraphile 语义，迁移需要人工维护 Smart Comment。尤其 unique index 不等同于 PostGraphile 识别的 unique constraint，需核对 `@unique`；内部表用 `@omit` 隐藏。迁移后重启 Data Server 与 Gateway，验证生成的查询、mutation 和前端类型。

迁移回归脚本位于 tests，使用临时 PostgreSQL 验证数据保留、约束和 Federation 查询。按脚本要求准备本地 PostgreSQL 工具，不将测试指向共享数据库。
