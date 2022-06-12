# `@lani/db`

即 `@prisma/client`，在 `rush build` 的时候会自动生成，用于解决 `@prisma/client` 生成的代码在 `rush deploy` 时不被保留的问题。

此外，也用于将 prisma schema 和 `@lani/api-server` 解耦。

所有原先使用 `@prisma/client` 的地方都可以替换为 `@lani/db`，除了 `@prisma/runtime` 需要使用 `@lani/db/dist/runtime` 导入。
