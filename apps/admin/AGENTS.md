# Admin 开发

GraphQL schema 或文档变更后，通过同时包含 Data/API 子图的 Gateway 生成类型，保持 Workflow 等 scalar 到共享协议的映射，避免手改生成文件。业务配置来自 API，登录配置由 Gateway 提供，开发代理及同源要求见[配置说明](docs/config.md)。

样式使用 `src/styles/theme-colors.less` 的 `--lani-*` 语义变量，新增颜色先扩展该入口。修改主题构建后，若 MFSU 沿用旧样式，停止服务并移走 `src/.umi/.cache` 后重启。

UI 回归覆盖桌面展开/折叠、移动端、系统主题变化、偏好持久化与跨标签页同步；切换时保留未保存输入和弹窗。截图使用演示数据。刷新与轮询变更需验证隐藏页面、离线、取消和迟到响应，避免旧请求覆盖新状态。
