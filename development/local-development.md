# 本地开发

本指南描述可复用的开发流程。维护者的私有部署仓库和集群不是普通代码开发与测试的前置条件；运行集成服务时，需要自行准备隔离的数据库、媒体服务及其他依赖。本仓库目前没有一条命令即可启动全部依赖的开发环境。

## 安装与构建

本地开发、GitHub Actions 和后端镜像统一使用 Node.js 22（最低 22.21.1）。`.nvmrc` 固定为已验证的 22.23.2。使用 nvm 时先执行 `nvm install && nvm use`，并通过 `node --version` 确认版本。Rush 和 pnpm 版本由 `rush.json` 固定，使用下列仓库脚本，无需全局安装它们。

工具链使用 Rush 5.181.0、pnpm 9.15.9，锁文件格式为 pnpm 9。不要使用旧版 pnpm 更新锁文件。文档站使用 Docusaurus 2.4.3；`common/config/rush/pnpm-config.json` 将其 Webpack 固定为 5.105.4，避开旧进度插件与 5.106 起参数校验的不兼容。

依赖安装使用 pnpm workspace 模式，由 Rush 生成 `common/temp/pnpm-workspace.yaml`，无需在根目录手工维护 workspace 文件。本地 `@lani/*` 依赖使用 `workspace:` 协议；`rush install` 会同时完成安装和项目链接，不再拆分执行 `install --no-link` 与 `rush link`。切换到包含新锁文件的分支后，运行 `node common/scripts/install-run-rush.js install` 更新本工作区的安装状态，无需再次执行 `update --full`。

TypeScript 保持在 4.7.4，以兼容现有 Nest GraphQL 编译插件；4.8 起的 AST 接口变更需要单独评估插件升级。`@types/node` 保留在现有 17.x 类型系列，它只决定类型检查，不改变实际使用的 Node.js 22 运行时。

在仓库根目录运行：

```bash
node common/scripts/install-run-rush.js install
node common/scripts/install-run-rush.js build --to @lani/gateway
```

按需把构建目标替换为 `@lani/api-server`、`@lani/data-server` 或 `@lani/admin`。修改依赖后运行 `node common/scripts/install-run-rush.js update` 更新锁文件，不单独维护包级锁文件。Admin 使用的 Umi 3/Webpack 在 Node.js 22 下仍需兼容设置；构建时将 `NODE_OPTIONS=--openssl-legacy-provider` 仅用于该构建命令。

镜像构建及系统依赖说明见 [CI/CD 指南](ci-cd.md#镜像构建)。

Prisma 3.15.2 对宿主机 OpenSSL 3.2 等较新 minor 的平台识别存在限制，可能报 `Unknown binaryTarget debian-openssl-3.2.x`。遇到此类错误，应在与镜像一致的 Bullseye/OpenSSL 1.1 容器中构建和验证数据库操作；不要将 `--openssl-legacy-provider` 当作 Prisma 平台识别的修复，它只影响 Node 自身的加密算法。

## 单元测试

先构建测试依赖：

```bash
node common/scripts/install-run-rush.js build --to @lani/api-server --to @lani/gateway --parallelism 1
```

随后分别在 `libs/workflow`、`libs/parse-torrent-title`、`apps/api-server`、`apps/admin` 中运行 `node ../../common/scripts/install-run-rushx.js test --runInBand`；在 `apps/gateway` 中运行 `node ../../common/scripts/install-run-rushx.js test`。

独立的 `.github/workflows/test.yaml` 对目标为 `next` 的 PR、`next` push 和手动触发执行这些测试，不发布镜像，不执行 e2e，不读取 `[skip-cd]` 标记。CI 使用一次性的 PostgreSQL 14 service，先执行现有迁移，再用 `prisma db push --skip-generate` 对齐当前 schema（历史迁移遗漏了一部分已有字段，此步骤仅用于一次性测试库），然后通过 `LANI_LIFECYCLE_TEST_DATABASE_URL` 启用 API 的数据库集成测试；下载器和媒体服务使用测试替身。

本地完整验证也应准备隔离 PostgreSQL，将数据库命名为 `*_test`，通过 `127.0.0.1` 连接。在 `libs/db` 使用该连接作为 `DATABASE_URL` 执行 `node ../../common/scripts/install-run-rushx.js migrate:deploy`，再执行 `node ../../common/scripts/install-run-rushx.js prisma:push --skip-generate` 对齐测试库 schema，然后把同一连接作为 `LANI_LIFECYCLE_TEST_DATABASE_URL` 运行 API 测试。不设置此变量时数据库测试会跳过，不能据此声称完整测试通过。`No tests found` 是失败，不应使用 `--passWithNoTests` 隐藏。

## 配置与依赖

后端通过 `CONFIG_FILENAME` 指定配置文件，未设置时默认读取进程工作目录下的 `config.yaml`。配置结构以代码为准：

- API Server：`apps/api-server/src/config/types.ts`，由 `apps/api-server/src/config/index.ts` 加载。
- Gateway：`apps/gateway/src/config.ts`；鉴权配置使用 `authority`、`clientId` 和 `authz`，可从 `apps/gateway/example.config.yaml` 准备自己的配置。
- Data Server：`apps/data-server/src/config.ts`；需要 `postgresUrl` 和 `postgraphile`，没有额外选项时也应提供 `postgraphile: {}`。
- Admin：`apps/admin/src/store/config.ts` 通过 GraphQL 获取配置，登录设置来自 Gateway；只启动 Umi 不代表整个应用已就绪。

将自行准备的开发配置放在各后端包的 `config.yaml` 中：`apps/api-server/config.yaml`、`apps/data-server/config.yaml` 和 `apps/gateway/config.yaml`。这些路径已由各包的 `.gitignore` 忽略。已有文件时先确认其用途，不要覆盖原配置；如需使用其他位置，可通过 `CONFIG_FILENAME` 指定，并确保该文件不会被提交。API 还需配置 `mediaPool.root`，使用与隔离下载和媒体库相同挂载卷内的独立目录；媒体池与升级回填见[设计说明](../apps/api-server/src/media-pool/DESIGN.md)。含凭据的文件应限制为仅当前用户可读写。不要提交实际配置，也不要复制维护者的远端凭据来代替自己的开发依赖。

本地 Gateway 的 subgraph 地址应与本次启动方式一致：API 默认使用 `http://127.0.0.1:3000/graphql`，下文的 Data Server 使用 `http://127.0.0.1:8083/graphql`，Gateway 自身使用 8080。数据库 schema 和迁移位于 `libs/db/prisma`；初始化前确认目标是隔离的开发数据库。

若设置了 HTTP/HTTPS 代理，应让本地请求绕过代理，并将环境变量传给服务进程：

```bash
export NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}"
export no_proxy="$NO_PROXY"
```

排查时可用 `curl --noproxy '*'` 对比直接请求，避免将代理故障误判为 GraphQL 故障。

## 启动前确认副作用

`rushx start:dev` 设置 `NODE_ENV=development`，但不会自动关闭 API 后台任务：

- `JellyfinSyncService.onApplicationBootstrap()` 会同步媒体文件夹并写数据库。
- 预检和中断恢复完成后，`TaskService.onApplicationBootstrap()` 会恢复未完成任务。
- Cron 任务仍可能运行，`LaniFilterCron` 只处理异常，不会因开发模式跳过任务。

启动 API 前，应确认数据库、下载器、媒体服务、存储及通知配置均用于隔离的开发环境。需要连接共享或维护者环境时，先确认目标和预期副作用，并遵守私有操作说明；不能将开发启动当作只读验证。

## 按需启动服务

不要运行 `start_tmux.sh`。为每个需要的服务使用独立终端，记录会话或 PID，便于结束后清理。以下命令均从仓库根目录开始，在各自终端中执行；配置文件需先按上文准备好。示例显式指定当前包的 `./config.yaml`，避免继承终端中可能指向其他环境的 `CONFIG_FILENAME`。

Data Server 使用 8083，避免与 Gateway 冲突：

```bash
cd apps/data-server
PORT=8083 CONFIG_FILENAME=./config.yaml node ../../common/scripts/install-run-rushx.js dev
```

确认 API 的依赖隔离后启动 API Server：

```bash
cd apps/api-server
CONFIG_FILENAME=./config.yaml node ../../common/scripts/install-run-rushx.js start:dev
```

两个 subgraph 就绪后启动 Gateway：

```bash
cd apps/gateway
CONFIG_FILENAME=./config.yaml node ../../common/scripts/install-run-rushx.js dev
```

需要前端时再启动 Admin：

```bash
cd apps/admin
node ../../common/scripts/install-run-rushx.js dev:umi
```

Umi 将 `/api/gateway` 代理到 `http://localhost:8080/`。GraphQL schema 或文档变化后，在 Gateway 可访问时于 `apps/admin` 执行 `node ../../common/scripts/install-run-rushx.js generate`；通常不必常驻 `dev:codegen`。

## 验证与清理

先运行受影响包的测试或 lint，检查 lint 是否自动修改文件。启动服务前确认端口未被占用；服务启动后，分别验证 subgraph，再确认 Gateway 完成 schema composition。按自己的鉴权配置安全提供 token，不将它写入命令行、日志或提交。

可向本地 Gateway 执行以下只读 query 验证跨 subgraph 路由：

```graphql
query LocalGatewayRouteProbe {
  environment
  allSeasons(first: 1) {
    totalCount
  }
  allTasks(first: 1) {
    totalCount
  }
}
```

`environment: "dev"` 是 API 开发模式的一个信号，还应结合 Gateway 的 subgraph 配置和本地服务日志确认请求确实路由到本次启动的进程。远端接口或远端 MCP 的成功响应不能证明本地服务正常。

结束后依次停止本轮启动的 Gateway、API、Data Server、Admin 和辅助进程，检查端口已释放。若使用了临时调试代码，先停止 watch 进程再恢复代码。检查 `git status --short`，保留用户原有修改。

不要用 `rushx devops` 验证本地改动；该命令可能推送代码并触发真实 CI/CD。
