# API Server 开发

启动前按根目录[开发说明](../../development/local-development.md)确认隔离依赖，开发模式仍会恢复任务并运行定时工作。业务写入通过所属模块的事务入口，保留任务版本、锁顺序和检查点约束。

后台处理先阅读[队列设计](src/background-queue/DESIGN.md)和[任务恢复设计](src/download-job/DESIGN.md)。新增行为需覆盖回滚、取消、重试、重启及迟到结果。当前执行模式为单 API 实例，增加副本前先解决协调机制。

在本包运行 `node ../../common/scripts/install-run-rushx.js test --runInBand`。数据库集成测试依赖 `LANI_LIFECYCLE_TEST_DATABASE_URL` 和隔离的本机 `*_test` 数据库；变量未设置时会跳过，不代表数据库路径已验证。Nyaa 相关回归可按 `nyaa-sync admin/torrent-subtitle` 筛选，迁移回归脚本位于 `libs/db/tests`。

lint 带自动修复，执行后检查差异。匹配、导入等模块的协议与设计说明位于 docs；新增说明优先记录约束和原因，接口细节由类型、schema 与测试维护。
