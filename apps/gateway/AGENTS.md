# Gateway 开发

认证变更先阅读[设计笔记](DESIGN.md)，保留执行前刷新错误、单次安全重试、CSRF、跨标签页协调和退出语义。日志及浏览器错误不得包含凭据或上游 token 响应。

`npm test` 使用 Node.js 测试运行器编译并执行 tests 中的测试。本地模拟身份服务可验证到期、轮换、冷启动、授权和故障；前端对应验证并发刷新与退出。使用[本地开发说明](../../development/local-development.md)中的 Gateway 和 Admin 配置，publicOrigin 与浏览器实际 origin 一致。
