# `@lani/all-in-one`

将 lani 用到的各个服务打包到一个 image 中，便于测试和部署。

部署时，应当使用 [`ghcr.io/std4453/lani-all-in-one`](https://github.com/std4453/lani/pkgs/container/lani-all-in-one)，具体的部署步骤请参考 [部署文档](https://std4453.github.io/lani/docs/category/%E9%83%A8%E7%BD%B2)。

## 实现细节

`@lani/all-in-one` 提供 Dockerfile、启动脚本和默认配置，将各服务装入同一个容器。

运行时，使用 `nginx` 部署静态前端文件，并反代后端接口。后端各服务通过 `pm2` 运行并 daemonize，崩溃时自动重启。由于 `@lani/gateway` 启动时需要 introspect 各微服务，在其他服务尚未完成启动时会崩溃重启，这是预期行为。

image 启动时运行 [`start.sh`](start.sh)，完成配置和数据库 migration 后，以 `exec pm2-runtime` 接管进程；nginx、MinIO 和三个后端服务由 [PM2 配置](ecosystem.config.js) 统一管理。

`@lani/all-in-one` 将所依赖的各服务设置为自身的 `devDependencies`，因此在 `rush build` 时会自动构建其他服务，而 `deploy` 时不会创建 `node_modules`。在 [`deploy.json`](../../common/config/rush/deploy.json) 中，将其他服务设置为 [`additionalProjectsToInclude`](https://rushjs.io/pages/maintainer/deploying/#including-additional-projects)。新增微服务时，需要将新服务加进去。

在 `rush deploy` 后，目录结构如下：

```
common/deploy/
├── apps
│   ├── admin
│   │   ├── dist
│   │   ├── nginx.conf
│   │   ├── node_modules
│   │   └── package.json
│   ├── all-in-one
│   │   ├── ecosystem.config.js
│   │   ├── nginx.conf
│   │   ├── package.json
│   │   └── start.sh
│   ├── api-server
│   │   ├── dist
│   │   ├── node_modules
│   │   └── package.json
│   ├── data-server
│   │   ├── dist
│   │   ├── node_modules
│   │   └── package.json
│   └── gateway
│       ├── dist
│       ├── node_modules
│       └── package.json
├── common
│   └── temp
│       └── node_modules
└── libs
```

`docker build` 时会将该目录复制到 `/deploy`。

启动必须挂载 `/config/config.yaml`。脚本将该文件覆盖合并到 [`defaults.yaml`](defaults.yaml)，把结果复制到三个后端的 `config.yaml`，再使用合并配置中的 `postgresUrl` 执行 `npm run migrate:deploy`。迁移失败会终止启动；启动脚本不负责数据库备份。持久化对象存储使用 `/storage`。

这是独立自托管容器的启动方式；维护者按 manifest 发布多个独立应用的 CI/CD 入口见 [工作流说明](../../.github/README.md)。
