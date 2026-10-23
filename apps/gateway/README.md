# Gateway

浏览器登录使用 Keycloak Authorization Code + PKCE。gateway 使用 [express-openid-connect](https://github.com/auth0/express-openid-connect) 处理授权码、PKCE/state/nonce、回调及加密 Cookie；前端只调用同源 `/api/gateway/auth/*` 和 GraphQL。gateway 不保存用户会话表，不依赖 Redis，也不需要粘性会话。

## 配置与迁移

参考 `example.config.yaml`。替换旧 SPA OAuth 配置时需要前后端配套更新，已有浏览器需重新登录。现有业务会话继续有效；旧会话没有刷新凭据，首次到期后需要重新登录一次才能启用自动刷新。业务 Cookie 名为 `__Host-lani-gateway`（本地 HTTP 为 `lani-local-gateway`），成功登录时清理旧会话 Cookie。运行时统一使用 Node.js 22（最低 22.21.1）。

- `authority` 是 realm 的公开 issuer，保持与 JWT `iss` 一致。
- `backchannelAuthority` 是同一 realm 的内网 URL。使用 `client_secret_post` 兼容 Keycloak 15 的 client ID 编码行为；保留 `/auth/realms/...` 路径。gateway 根据 Keycloak 的固定端点构造 metadata，启动不请求 discovery。
- `publicOrigin` 是浏览器前端 origin，回调固定为 `${publicOrigin}/api/gateway/auth/callback`。反向代理继续剥离 `/api/gateway` 前缀。不要根据请求 Host 拼接回调。
- 使用开启 Standard Flow 的 **confidential client**。精确注册固定回调，不使用通配符。在服务端配置中填写 `auth.clientSecret` 和 `auth.cookieKeys`，启动时直接读取；这些值不会经 `/auth_config` 或 `/auth/session` 返回给浏览器。实际凭据只保存在私有部署配置中，公共示例使用占位值。
- `audience` 是 **access token** 中预期的 `aud`，不一定等于 client ID。需要在 Keycloak 配置相应 audience mapper；不要通过关闭校验迁就缺失的 audience。
- 保留原 `authz` 规则：浏览器登录和刷新时验证 access token 的签名、issuer、audience、有效期和权限，通过后才签发 gateway session；Bearer 请求仍逐次验证。ID token 由 OIDC SDK 验证并提供身份资料，其 subject 必须与 access token 一致。
- `scope` 默认 `openid profile email`。用户名、头像等来自 ID token；需要的 mapper 应启用 Add to ID token。正常页面加载不请求 userinfo。

生成 Cookie 密钥：

```sh
node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64"))'
```

把结果作为一项放入 `auth.cookieKeys` 数组，所有 gateway 副本共享。滚动轮换时先让所有副本同时接受新旧密钥，再将新密钥放在首位用于加密；旧 Cookie 的最长寿命过去后再删除旧密钥。不要每次重启随机生成。

## 会话行为

浏览器通过同源 HttpOnly Cookie 使用服务。会话有效期间只校验本地 Cookie，认证服务暂不可达时仍可访问；到期后使用独立刷新 Cookie 重新验证权限。登录后的权限变化和 SSO 退出在下一次刷新或登录时生效，已签发会话没有即时撤销能力。

退出会清除本应用 Cookie，保留其他应用的 SSO 状态。MCP 和命令行继续使用 Bearer JWT。认证、刷新和故障处理的设计原因见[认证设计](DESIGN.md)。
