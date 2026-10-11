# Gateway authentication

浏览器登录使用 Keycloak Authorization Code + PKCE。gateway 使用 [express-openid-connect](https://github.com/auth0/express-openid-connect) 处理授权码、PKCE/state/nonce、回调及加密 Cookie；前端只调用同源 `/api/gateway/auth/*` 和 GraphQL。gateway 不保存用户会话表，不依赖 Redis，也不需要粘性会话。

## 配置与迁移

参考 `example.config.yaml`。这是原 SPA OAuth 配置的替换方案，需要前后端配套更新；旧 `clientConfig` 不再支持，已有浏览器登录在迁移后需要重新建立一次 Cookie。从此前保存 OAuth token 的 Cookie 实现升级也需要重新登录一次；新 Cookie 名为 `__Host-lani-gateway`（本地 HTTP 为 `lani-local-gateway`），成功登录时清理旧会话 Cookie。运行时要求 Node 20.19+ 或 22.12+。

- `authority` 是 realm 的公开 issuer，保持与 JWT `iss` 一致。
- `backchannelAuthority` 是同一 realm 的内网 URL。使用 `client_secret_post` 兼容 Keycloak 15 的 client ID 编码行为；保留 `/auth/realms/...` 路径。gateway 根据 Keycloak 的固定端点构造 metadata，启动不请求 discovery。
- `publicOrigin` 是浏览器前端 origin，回调固定为 `${publicOrigin}/api/gateway/auth/callback`。反向代理继续剥离 `/api/gateway` 前缀。不要根据请求 Host 拼接回调。
- 使用开启 Standard Flow 的 **confidential client**。精确注册固定回调，不使用通配符。在服务端配置中填写 `auth.clientSecret` 和 `auth.cookieKeys`，启动时直接读取；这些值不会经 `/auth_config` 或 `/auth/session` 返回给浏览器。实际凭据只保存在私有部署配置中，公共示例使用占位值。
- `audience` 是 **access token** 中预期的 `aud`，不一定等于 client ID。需要在 Keycloak 配置相应 audience mapper；不要通过关闭校验迁就缺失的 audience。
- 保留原 `authz` 规则：浏览器登录时验证 access token 的签名、issuer、audience、有效期和权限，通过后才签发 gateway session；Bearer 请求仍逐次验证。ID token 由 OIDC SDK 验证并提供身份资料，其 subject 必须与 access token 一致。
- `scope` 默认 `openid profile email`。用户名、头像等来自 ID token；需要的 mapper 应启用 Add to ID token。正常页面加载不请求 userinfo。

生成 Cookie 密钥：

```sh
node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64"))'
```

把结果作为一项放入 `auth.cookieKeys` 数组，所有 gateway 副本共享。滚动轮换时先让所有副本同时接受新旧密钥，再将新密钥放在首位用于加密；旧 Cookie 的最长寿命过去后再删除旧密钥。不要每次重启随机生成。

## 凭据与故障行为

Cookie 使用 JWE `dir` + `A256GCM`，由 SDK 派生密钥并加解密，仅包含已授权用户的 subject、显示资料、授权标记和固定到期时间；不保存 access token、refresh token 或 ID token。HTTPS 下使用 `__Host-` 前缀、HttpOnly、Secure、SameSite=Lax、Path=/，无 Domain。Lax 允许外部登录页回调携带短期事务 Cookie。仅本地 loopback HTTP 使用非 Secure 开发 Cookie。

会话 JSON 限制为 4200 字节，SDK 自动分块以满足每个 Cookie 的 4096 字节限制；超限会拒绝写入。group 列表及其他不需要的 token claims 不写入 Cookie。登录事务由 SDK 保存在独立的签名 HttpOnly Cookie 中，包含 state、nonce 和 PKCE verifier，回调额外检查事务不超过 10 分钟并限制站内返回路径。同一浏览器同时发起多个登录时，最新事务覆盖旧事务；旧回调会回到干净的重试页面。

- `/auth/session` 只返回登录状态、用户资料和 gateway session 到期时间，不返回 token、不自动跳转。前端在初始化或主动登录时查询；普通 GraphQL 请求直接携带 Cookie，不做会话预检。
- gateway session 独立于 Keycloak token，使用 `sessionMaxAge` 控制绝对有效期，默认 8 小时。不滚动续期，无 `/auth/refresh`，不保存或使用 refresh token。已有配置显式指定的 `sessionMaxAge` 继续生效，升级时应检查是否符合新的独立会话期限。
- session 有效期间只校验 Cookie 和本地有效期，不访问 Keycloak/JWKS。即使 accounts 不可达、token 过期或 gateway 冷启动，有效 session 仍可用。到期后重新登录；Keycloak SSO 仍有效时通常无需再次输入密码。
- 登录后的 group 变化、账号禁用、Keycloak SSO 退出不会立即撤销已签发 session；在下一次登录时重新评估。纯无状态模式不提供逐会话的即时撤销。不要仅凭旧 session 无限延长有效期。
- GraphQL 返回 `UNAUTHENTICATED` 后前端显示登录入口，不自动重放 query/mutation，也不进行 token 续期。其他业务权限规则仍由业务层执行。
- 已有有效 Cookie 时，重复访问已消费 callback 会直接返回业务页；失败 callback 跳到干净地址并显示重试入口，不进入自动登录循环。
- 所有 Cookie 鉴权 GraphQL 请求及 logout POST 都要求精确匹配 `publicOrigin` 的 Origin 和 `X-Lani-CSRF: 1`。不开放跨域 CORS；SameSite 不能代替对同站点其他子域的防护。
- MCP/命令行/其他客户端可继续使用 Bearer JWT，不需要 Cookie/CSRF header，仍校验签名、issuer、有效期、audience 和 authz。显式无效 Bearer 不回退到 Cookie。原来用于 schema/codegen 的完整标准 introspection 查询仍保留免鉴权行为。
- JWKS 按需获取并在进程内缓存，这是可丢弃的公钥缓存，不是用户会话状态。新登录或 Bearer 请求需要公钥且无法获取时返回认证错误，不能绕过验签；不影响已有浏览器 session。
- 普通读取和失败响应不重写或清空 Cookie，防止延迟返回的响应在退出后重新写回会话。会话 Cookie 只在成功登录、退出时写入。
- 退出仅清除 gateway Cookie，不请求 accounts、不跳公网 SSO 退出页，不影响其他应用。下一次主动登录可能利用仍有效的 Keycloak SSO。

## 本地验证

不需要修改或占用测试环境。可复用已有只读业务子图；认证测试使用本地模拟 Keycloak，覆盖固定会话到期、token 过期后的访问、冷启动副本、登录授权及身份服务故障。

在安装项目依赖后运行（测试运行器要求 Node 22+）：

```sh
cd apps/gateway
npm test
```

前端开发默认代理到本机 `http://127.0.0.1:8080`，可用 `LANI_GATEWAY_URL` 修改；`publicOrigin` 应配置成前端 dev server 的 origin。只有显式配置代理目标才会访问远程 gateway。

`npm test` 使用统一的 `tests/tsconfig.json` 编译全部 `tests/*.test.ts`，再由 Node 测试运行器一次执行；认证测试与图片代理、路由测试共用 `.test-dist` 产物。只启动本地 HTTP 模拟服务，不需要浏览器、前端构建或外部服务。
