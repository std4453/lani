# Gateway authentication

浏览器登录使用 Keycloak Authorization Code + PKCE。gateway 使用 [express-openid-connect](https://github.com/auth0/express-openid-connect) 处理授权码、PKCE/state/nonce、回调及加密 Cookie；前端只调用同源 `/api/gateway/auth/*` 和 GraphQL。gateway 不保存用户会话表，不依赖 Redis，也不需要粘性会话。

## 配置与迁移

参考 `example.config.yaml`。这是原 SPA OAuth 配置的替换方案，需要前后端配套更新；旧 `clientConfig` 不再支持，已有浏览器登录在迁移后需要重新建立一次 Cookie。现有业务会话继续有效；旧会话没有刷新凭据，首次到期后需要重新登录一次才能启用自动刷新。业务 Cookie 名为 `__Host-lani-gateway`（本地 HTTP 为 `lani-local-gateway`），成功登录时清理旧会话 Cookie。运行时统一使用 Node.js 22（最低 22.21.1）。

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

## 凭据与故障行为

业务 Cookie 使用 JWE `dir` + `A256GCM`，由 SDK 派生密钥并加解密，仅包含已授权用户的 subject、显示资料、授权标记和业务到期时间，不保存 access token 或 ID token。独立的 `__Host-lani-refresh`（本地为 `lani-local-refresh`）Cookie 保存 refresh token、subject、显示资料和刷新期限；使用同一组配置密钥经独立用途的 HKDF 派生，再通过 JWE 加密，并绑定 origin、issuer 和 client ID。两类 Cookie 均不能由前端 JavaScript 读取。HTTPS 下使用 `__Host-` 前缀、HttpOnly、Secure、SameSite=Lax、Path=/，无 Domain。Lax 允许外部登录页回调携带短期事务 Cookie。仅本地 loopback HTTP 使用非 Secure 开发 Cookie。

刷新 Cookie 密文限制为 3800 字符，超限拒绝登录或刷新，不保存明文、不降级到服务端存储。业务会话 JSON 限制为 4200 字节，SDK 自动分块以满足每个 Cookie 的 4096 字节限制；超限会拒绝写入。group 列表及其他不需要的 token claims 不写入 Cookie。登录事务由 SDK 保存在独立的签名 HttpOnly Cookie 中，包含 state、nonce 和 PKCE verifier，回调额外检查事务不超过 10 分钟并限制站内返回路径。同一浏览器同时发起多个登录时，最新事务覆盖旧事务；旧回调会回到干净的重试页面。

- `/auth/session` 返回登录状态、用户资料、业务会话到期时间和 `refreshRequired`，不返回 token、不自动跳转。前端初始化时可据此刷新；普通 GraphQL 请求直接携带 Cookie，不做会话预检。
- `sessionMaxAge` 是每次签发业务会话的最长有效期，默认 8 小时。不因普通读取滚动续期。Keycloak 提供 `refresh_expires_in` 时，业务有效期还会限制为剩余刷新窗口的一半，给活跃用户留下续期时间，避免较短的 Keycloak idle timeout 先耗尽刷新凭据。
- `refreshMaxAge` 是从首次登录开始计算、不可滚动延长的刷新绝对上限，默认 7 天，最多 30 天。刷新 Cookie 的实际期限取此上限与 Keycloak 返回期限的较早值；没有新的期限时保留已有期限。Keycloak 的 SSO/client idle、max lifetime、撤销和轮换策略继续生效，长时间离线可能需要重新登录。
- session 有效期间只校验 Cookie 和本地有效期，不访问 Keycloak/JWKS。即使 accounts 不可达、access token 过期或 gateway 冷启动，有效 session 仍可用。业务会话过期但刷新凭据仍有效时，Gateway 在执行 GraphQL 之前返回 HTTP 401，错误带 `SESSION_REFRESH_REQUIRED` 和 `authPhase: gateway`，不包含业务数据。
- 前端只对上述明确的执行前错误调用 `POST /auth/refresh`，成功后重试原请求一次。其他业务错误、部分结果、网络错误不会重放 query/mutation。刷新成功后 Gateway 校验新 access token 的签名、issuer、audience、有效期、subject 和 authz；有新 ID token 时校验签名、issuer、client ID、有效期及 subject，再签发新业务 Cookie 和刷新 Cookie。access token 只在验证期间使用。
- refresh token 失效返回 `LOGIN_REQUIRED`，前端重新走 OAuth；权限撤销返回 403；认证服务不可用返回 503，保留 Cookie，允许稍后重试。不把错误响应中的 token 或上游错误详情返回浏览器。
- 前端同标签页合并刷新请求，跨标签页通过 Web Locks 串行执行刷新和退出；锁内后端会复用已有效的业务会话，不重复消费 refresh token。没有 Web Locks 或无法使用本地存储记录退出代次时，自动刷新回退到 OAuth 登录。浏览器正常请求均走这一协调路径；外部客户端并发重放旧刷新 Cookie、刷新成功后响应丢失，仍可能触发上游轮换检测并要求重新登录，纯无状态 Gateway 不维护跨副本去重表。
- 登录后的 group 变化、账号禁用、Keycloak SSO 退出不会立即撤销已签发的业务 session；在下一次刷新或登录时重新评估。纯无状态模式不提供逐会话的即时撤销；被复制的 Cookie 在失效前仍可能被重放，加密不能代替撤销。
- 已有有效 Cookie 时，重复访问已消费 callback 会直接返回业务页；失败 callback 跳到干净地址并显示重试入口，不进入自动登录循环。
- 所有 Cookie 鉴权 GraphQL 请求及 refresh/logout POST 都要求精确匹配 `publicOrigin` 的 Origin 和 `X-Lani-CSRF: 1`。不开放跨域 CORS；SameSite 不能代替对同站点其他子域的防护。
- MCP/命令行/其他客户端可继续使用 Bearer JWT，不需要 Cookie/CSRF header，仍校验签名、issuer、有效期、audience 和 authz。显式无效 Bearer 不回退到 Cookie。原来用于 schema/codegen 的完整标准 introspection 查询仍保留免鉴权行为。
- JWKS 按需获取并在进程内缓存，这是可丢弃的公钥缓存，不是用户会话状态。新登录或 Bearer 请求需要公钥且无法获取时返回认证错误，不能绕过验签；不影响已有浏览器 session。
- 普通读取和失败响应不重写或清空 Cookie，防止延迟返回的响应在退出后重新写回会话。业务 Cookie 只在成功登录、刷新和退出时写入；刷新 Cookie 同样只在这些操作中更新。业务有效期由加密内容中的 `expiresAt` 控制，Cookie 的保存期限可以更长，不能仅凭 Cookie 存在判定会话有效。
- 退出串行等待本浏览器尚未完成的刷新，并清除业务和刷新两类 Cookie；不请求 accounts、不跳公网 SSO 退出页，不影响其他应用。下一次主动登录可能利用仍有效的 Keycloak SSO。

## 本地验证

不需要修改或占用测试环境。可复用已有只读业务子图；认证测试使用本地模拟 Keycloak，覆盖业务会话到期后的刷新、刷新绝对上限、密钥和 token 轮换、冷启动副本、登录及刷新授权、CSRF、退出和身份服务故障。前端测试覆盖单次安全重试、并发合并、跨标签页锁和退出代次。

在安装项目依赖后运行（测试运行器要求 Node 22+）：

```sh
cd apps/gateway
npm test
```

前端开发默认代理到本机 `http://127.0.0.1:8080`，可用 `LANI_GATEWAY_URL` 修改；`publicOrigin` 应配置成前端 dev server 的 origin。只有显式配置代理目标才会访问远程 gateway。

`npm test` 使用统一的 `tests/tsconfig.json` 编译全部 `tests/*.test.ts`，再由 Node 测试运行器一次执行；认证测试与图片代理、路由测试共用 `.test-dist` 产物。只启动本地 HTTP 模拟服务，不需要浏览器、前端构建或外部服务。
