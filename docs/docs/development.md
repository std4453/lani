# 本地开发

本指南描述可复用的开发流程。维护者的私有部署仓库和集群不是普通代码开发与测试的前置条件；运行集成服务时，需要自行准备隔离的数据库、媒体服务及其他依赖。本仓库目前没有一条命令即可启动全部依赖的开发环境。

## 安装与构建

当前 GitHub Actions 使用 Node 20，开发时优先对齐该版本；根目录 `.nvmrc` 仍为旧版本，不能据此认为当前 CI 使用 Node 16。

在仓库根目录运行：

```bash
node common/scripts/install-run-rush.js install
node common/scripts/install-run-rush.js build --to @lani/gateway
```

按需把构建目标替换为 `@lani/api-server`、`@lani/data-server` 或 `@lani/admin`。修改依赖后用 `rush update` 更新锁文件，不单独维护包级锁文件。Admin 使用的旧版 Umi/Webpack 在 Node 20 下需要兼容设置；构建时可对齐 CI，将 `NODE_OPTIONS=--openssl-legacy-provider` 仅用于该构建命令。

## 配置与依赖

后端通过 `CONFIG_FILENAME` 指定配置文件，未设置时默认读取进程工作目录下的 `config.yaml`。配置结构以代码为准：

- API Server：`apps/api-server/src/config/types.ts`，由 `apps/api-server/src/config/index.ts` 加载。
- Gateway：`apps/gateway/src/config.ts`；鉴权配置使用 `authority`、`clientId` 和 `authz`，旧的 `example.config.yaml` 不应直接照抄。
- Data Server：`apps/data-server/src/config.ts`；需要 `postgresUrl` 和 `postgraphile`，没有额外选项时也应提供 `postgraphile: {}`。
- Admin：`apps/admin/src/store/config.ts` 通过 GraphQL 获取配置，登录设置来自 Gateway；只启动 Umi 不代表整个应用已就绪。

将自行准备的开发配置放在各后端包的 `config.yaml` 中：`apps/api-server/config.yaml`、`apps/data-server/config.yaml` 和 `apps/gateway/config.yaml`。这些路径已由各包的 `.gitignore` 忽略。已有文件时先确认其用途，不要覆盖原配置；如需使用其他位置，可通过 `CONFIG_FILENAME` 指定，并确保该文件不会被提交。含凭据的文件应限制为仅当前用户可读写。不要提交实际配置，也不要复制维护者的远端凭据来代替自己的开发依赖。

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
- `JobService.onApplicationBootstrap()` 会恢复未完成的下载任务。
- Cron 任务仍可能运行，`LaniFilterCron` 只处理异常，不会因开发模式跳过任务。

启动 API 前，应确认数据库、下载器、媒体服务、存储及通知配置均用于隔离的开发环境。需要连接共享或维护者环境时，先确认目标和预期副作用，并遵守私有操作说明；不能将开发启动当作只读验证。

## 按需启动服务

不要运行 `start_tmux.sh`。为每个需要的服务使用独立终端，记录会话或 PID，便于结束后清理。以下命令均从仓库根目录开始，在各自终端中执行；配置文件需先按上文准备好。示例显式指定当前包的 `./config.yaml`，避免继承终端中可能指向其他环境的 `CONFIG_FILENAME`。

Data Server 使用 8083，避免与 Gateway 冲突：

```bash
cd apps/data-server
PORT=8083 CONFIG_FILENAME=./config.yaml rushx dev
```

确认 API 的依赖隔离后启动 API Server：

```bash
cd apps/api-server
CONFIG_FILENAME=./config.yaml rushx start:dev
```

两个 subgraph 就绪后启动 Gateway：

```bash
cd apps/gateway
CONFIG_FILENAME=./config.yaml rushx dev
```

需要前端时再启动 Admin：

```bash
cd apps/admin
rushx dev:umi
```

Umi 将 `/api/gateway` 代理到 `http://localhost:8080/`。GraphQL schema 或文档变化后，在 Gateway 可访问时于 `apps/admin` 执行 `rushx generate`；通常不必常驻 `dev:codegen`。

## 验证与清理

先运行受影响包的测试或 lint，检查 lint 是否自动修改文件。启动服务前确认端口未被占用；服务启动后，分别验证 subgraph，再确认 Gateway 完成 schema composition。按自己的鉴权配置安全提供 token，不将它写入命令行、日志或提交。

可向本地 Gateway 执行以下只读 query 验证跨 subgraph 路由：

```graphql
query LocalGatewayRouteProbe {
  environment
  allSeasons(first: 1) {
    totalCount
  }
  allDownloadJobs(first: 1) {
    totalCount
  }
}
```

`environment: "dev"` 是 API 开发模式的一个信号，还应结合 Gateway 的 subgraph 配置和本地服务日志确认请求确实路由到本次启动的进程。远端接口或远端 MCP 的成功响应不能证明本地服务正常。

结束后依次停止本轮启动的 Gateway、API、Data Server、Admin 和辅助进程，检查端口已释放。若使用了临时调试代码，先停止 watch 进程再恢复代码。检查 `git status --short`，保留用户原有修改。

不要用 `rushx devops` 验证本地改动；该命令可能推送代码并触发真实 CI/CD。
