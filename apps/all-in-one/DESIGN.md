# 一体机启动与打包

一体机通过 nginx 提供前端及反向代理，PM2 管理长驻服务。启动脚本先合并用户配置并执行数据库迁移，再以 `exec pm2-runtime` 接管进程，使容器生命周期与服务管理一致。Gateway 在子图尚未就绪时可能重启，由进程管理器等待依赖收敛。

其他服务作为 devDependencies 参与 Rush 构建，再通过 `deploy.json` 的 additionalProjectsToInclude 纳入部署目录。两者分别控制构建顺序和交付内容，新增服务时需一起检查。迁移、模型和原生系统依赖的兼容条件见[构建说明](../../development/ci-cd.md#镜像构建)。
