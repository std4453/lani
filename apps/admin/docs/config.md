# 配置

管理端通过 Gateway 获取运行配置，无需挂载或在 `public/` 中创建 `config.json`。

- 登录前请求 `/api/gateway/auth_config`，由 Gateway 返回是否启用鉴权及 OIDC 客户端配置。
- 登录后通过 `/api/gateway/graphql` 的 `config` query 获取 API Server 提供的 Jellyfin/Lania 公开地址、功能开关和环境标识。

鉴权在 Gateway 的 `config.yaml` 中配置，字段为 `auth.enabled`、`auth.authority`、
`auth.clientId`、`auth.authz` 和可选的 `auth.clientConfig`，参见
[Gateway 示例](../../gateway/example.config.yaml) 与 [配置 schema](../../gateway/src/config.ts)。
`auth.clientConfig` 会发送给浏览器，只能放公开的客户端设置，不能放 client secret。

界面中的 Jellyfin 链接来自 API Server 的 `jellyfin.publicHost`；其余公开配置的映射见
[AdminResolver](../../api-server/src/admin/index.resolver.ts)。数据库连接、下载器密码和
Jellyfin API token 等服务端凭据应留在后端配置中。

部署时，入口需将 `/api/gateway/` 转发到 Gateway 并去掉此前缀，同时由 Admin 提供
页面与静态资源。独立 Admin 镜像本身只提供静态文件；一体机已包含该反向代理。
本地 Umi 开发代理及后端配置方法见 [开发指南](../../../docs/docs/development.md)。
