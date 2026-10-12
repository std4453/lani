# 配置与认证

业务配置通过 gateway GraphQL 获取。登录配置由 gateway 管理，参考 [Gateway 说明](../../gateway/README.md)和[配置示例](../../gateway/example.config.yaml)。

前端不再直接连接 Keycloak，也不在 JavaScript storage 中保存 access token 或 refresh token。启动时请求 `/api/gateway/auth/session`；没有会话时进入 gateway 的登录入口，已有会话时直接恢复页面。登录失败会展示重试入口；退出后不会自动重新登录。

前端、gateway 必须通过同一 origin 访问；代理 `/api/gateway/` 到 gateway 并剥离这个前缀。浏览器自动携带 HttpOnly Cookie，前端为写接口及 GraphQL 添加 CSRF header。

开发服务器默认将 `/api/gateway` 转发到 `http://127.0.0.1:8080`，也可设置 `LANI_GATEWAY_URL`。gateway 的 `publicOrigin` 必须与浏览器实际访问的前端地址一致。需要 `/api/storage` 等其他服务时自行配置代理，不会默认访问共享测试环境。

无需认证的独立部署可在 gateway 配置 `auth.enabled: false`。不要只关闭前端鉴权；授权始终由 gateway 决定。

业务配置仍由 API Server 的 `config` query 提供，包括 Jellyfin/Lania 公开地址、功能开关和环境标识。测试路由弹窗继续由 `debug.testRoutingEnabled` 控制。
