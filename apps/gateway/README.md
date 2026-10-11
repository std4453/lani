# Gateway authentication

浏览器登录使用 Keycloak Authorization Code + PKCE。gateway 处理回调、换取和刷新 token；前端只调用同源 `/api/gateway/auth/*` 和 GraphQL。gateway 不保存用户会话表，不依赖 Redis，也不需要粘性会话。

## 配置与迁移

参考 `example.config.yaml`。这是原 SPA OAuth 配置的替换方案，需要前后端配套更新；旧 `clientConfig` 不再支持，已有浏览器登录在迁移后需要重新建立一次 Cookie。

- `authority` 是 realm 的公开 issuer，保持与 JWT `iss` 一致。
- `backchannelAuthority` 是同一 realm 的内网 URL。Keycloak 15.0.2 可用；保留 `/auth/realms/...` 路径。gateway 根据 Keycloak 的固定端点构造 metadata，启动不请求 discovery。
- `publicOrigin` 是浏览器前端 origin，回调固定为 `${publicOrigin}/api/gateway/auth/callback`。反向代理继续剥离 `/api/gateway` 前缀。不要根据请求 Host 拼接回调。
- 使用开启 Standard Flow 的 **confidential client**。精确注册固定回调，不使用通配符。client secret 通过 `LANI_OIDC_CLIENT_SECRET` 注入；不需要把 secret 交给浏览器。
- `audience` 是 **access token** 中预期的 `aud`，不一定等于 client ID。需要在 Keycloak 配置相应 audience mapper；不要通过关闭校验迁就缺失的 audience。
- 保留原 `authz` 规则；Cookie 和 Bearer 请求都校验权限。ID token 只提供显示信息，不能代替 access token 授权。
- `scope` 默认 `openid profile email`。用户名、头像等来自 ID token；需要的 mapper 应启用 Add to ID token。正常页面加载不请求 userinfo。

生成 Cookie 密钥：

```sh
node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64"))'
```

把结果放入 `LANI_AUTH_COOKIE_KEYS`，所有 gateway 副本共享。滚动轮换时先让所有副本同时接受新旧密钥，再将新密钥放在首位用于加密；旧 Cookie 的最长寿命过去后再删除旧密钥。不要每次重启随机生成。

## 凭据与故障行为

Cookie 使用 JWE `dir` + `A256GCM`，包含原始 access token、refresh token 和少量显示字段。HTTPS 下使用 `__Host-` 前缀、HttpOnly、Secure、SameSite=Lax、Path=/，无 Domain。Lax 允许外部登录页回调携带短期事务 Cookie。仅本地 loopback HTTP 使用非 Secure 开发 Cookie。

每份会话最多拆成两个 3000 字符 Cookie；超限会明确拒绝登录。避免将大型 group 列表和不需要的 claims 加入 token，部署前应使用真实用户检查 Cookie/代理请求头限制。登录事务保存在独立、10 分钟过期的加密 Cookie 中，包含 state、nonce、PKCE verifier 和校验过的站内返回路径。

- `/auth/session` 不返回 token、不自动跳转。有效会话直接恢复；接近过期或已过期时，前端调用 `/auth/refresh`。
- 同一标签页合并续期请求，支持 Web Locks 的浏览器在同源标签页间串行续期和退出。服务端收到 refresh 请求后再次检查最新 Cookie，避免重复轮换。无 Web Locks 的浏览器只有标签页内合并和失败后重读 Cookie 的恢复；严格轮换下的跨标签页竞争不能保证消除。非浏览器调用者也必须自行串行续期。
- gateway 不自动重放 GraphQL 操作，避免重复执行 mutation。
- 已有有效 Cookie 时，重复访问已消费 callback 会直接返回业务页；失败 callback 跳到干净地址并显示重试入口，不进入自动登录循环。
- 所有 Cookie 鉴权 GraphQL 请求及 refresh/logout POST 都要求精确匹配 `publicOrigin` 的 Origin 和 `X-Lani-CSRF: 1`。不开放跨域 CORS；SameSite 不能代替对同站点其他子域的防护。
- 命令行/其他客户端可继续使用 Bearer JWT，不需要 Cookie/CSRF header。原来用于 schema/codegen 的完整标准 introspection 查询仍保留免鉴权行为。
- JWKS 按需获取并在进程内缓存，这是可丢弃的公钥缓存，不是用户会话状态。Keycloak 不可达时，有效凭据且公钥缓存可用的请求继续工作；冷启动/缓存需要重新获取时，受影响请求返回 `AUTH_UNAVAILABLE`，不能绕过验签。
- 网络故障或暂时不可用不会主动删除凭据。refresh 被明确拒绝时，用户可以重新登录；Cookie 不在失败响应中清空，避免覆盖另一个成功续期响应。
- 退出清除本地 Cookie，并尽力通过内网撤销 refresh token；不跳公网 SSO 退出页。它是此应用的退出，不保证退出其他应用。下一次主动登录可能利用仍有效的 Keycloak SSO。
- 无状态本地验签不能即时撤销已经签发的 access token；保留短期 access token，依赖 Keycloak 控制后续刷新。绝对会话寿命默认 7 天，刷新不延长这个上限。

## 本地验证

不需要修改或占用测试环境。可复用已有只读业务子图；认证测试使用本地模拟 Keycloak，覆盖严格 refresh token 轮换、两个独立 gateway 实例和身份服务故障。

在安装项目依赖后运行（测试运行器要求 Node 22+）：

```sh
cd apps/gateway
npm test
```

前端开发默认代理到本机 `http://127.0.0.1:8080`，可用 `LANI_GATEWAY_URL` 修改；`publicOrigin` 应配置成前端 dev server 的 origin。只有显式配置代理目标才会访问远程 gateway。

完整浏览器测试先构建前端和 gateway 测试模块，再运行 `test/browser.cjs`：

```sh
# 在仓库根目录
(cd apps/admin && NODE_OPTIONS=--openssl-legacy-provider node node_modules/umi/bin/umi.js build)
npm test --prefix apps/gateway
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node apps/gateway/test/browser.cjs
```

Playwright 需已安装 Chromium。`NODE_OPTIONS` 仅用于旧版 Umi/Webpack 在较新 Node/OpenSSL 上构建，生产代码不依赖此设置。浏览器测试使用本地模拟 OIDC/API，并阻止所有非 loopback 网络请求；不会使用真实账号或改动共享数据库。

正常构建 gateway 后，可运行 `node apps/gateway/test/startup.cjs` 验证实际进程在 Keycloak 不可达时仍可启动，以及关闭鉴权的配置。
