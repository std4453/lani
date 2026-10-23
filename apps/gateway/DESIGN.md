# 无状态认证设计

Gateway 使用 OIDC SDK 管理授权码、PKCE、state 和 nonce，业务会话放在加密 Cookie 中。这样冷启动和多副本无需共享会话存储，但代价是已签发会话无法逐个即时撤销，复制的 Cookie 在失效前仍可能被重放。业务会话与刷新凭据使用独立用途的密钥派生和 Cookie，限制刷新 token 暴露范围。

会话读取只校验本地加密内容及有效期，新登录、刷新和 Bearer 请求才验证身份服务签名与授权。业务到期时间为刷新窗口预留余量，刷新绝对上限从首次登录计算。身份服务不可达时保留 Cookie 供稍后重试；失效凭据要求重新登录，权限撤销返回拒绝。

前端只在 Gateway 明确报告“尚未执行业务、需要刷新”时刷新并重试一次。网络错误、部分结果和业务失败无法证明操作未执行，尤其 mutation 重放可能重复写入。跨标签页以 Web Locks 串行刷新和退出，避免上游 refresh token 轮换冲突；缺少协调能力时回退到 OAuth 登录。纯无状态服务仍无法替外部客户端去重并发刷新。

Cookie 鉴权请求要求精确 Origin 和 CSRF header，SameSite 无法阻挡同站点其他子域。回调使用配置的 publicOrigin，避免请求 Host 影响认证目标。显式无效 Bearer 请求不能回退 Cookie，以免掩盖调用方凭据错误。标准完整 introspection 查询保留给 schema/codegen 使用。

成功登录、刷新和退出才写 Cookie，普通读取及失败响应保持原样，防止迟到请求在退出后恢复会话。Cookie 大小受浏览器限制，过大时明确拒绝，不能静默截断凭据。刷新 Cookie 绑定 origin、issuer 和 client ID，避免跨环境复用。
