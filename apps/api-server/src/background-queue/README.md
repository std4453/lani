# 单实例后台任务队列

队列名称、是否启用、处理器与重试策略由 API 代码注册，不维护定义表。当前匹配通道常量在 `torrent-match/queues.ts`；不使用数据库枚举，新增通道不需要迁移。只有 `background_jobs` 持久化工作。业务检查点由所属模块保存，不塞进通用队列。

## 生产与消费协议

生产者在业务事务里调用 `enqueueJob(tx, queueName, key, payload, availableAt?)`，或等价的 `BackgroundQueueService.enqueue`。payload 必须可 JSON 序列化。同 key 合并为最新输入、增加 revision 并保留首次排队位置；替换失败任务不解除失败屏障。事务回滚不会留下孤立工作。

处理器通过 `register(name, { enabled, ready?, execute, settled?, retry? })` 注册。`ready` 返回 false 或执行抛 `QueueWaiting` 表示依赖等待，保留队头，不记为失败；`execute` 在事务外执行耗时工作，返回只写数据库的提交函数。结果提交与删除当前 revision 的任务在同一事务；输入已被替换则整体回滚旧结果。`settled` 同步释放进程内资源，不能抛异常。

每个通道按 ID FIFO，每轮最多 50 条，每 5 秒检查一次，生产者可在事务提交后主动 wake。等待、延迟重试和失败的队头都会阻塞后续任务。仅支持单 API 消费实例；不提供租约或多副本抢占。重启恢复 running 为 pending，处理器必须容许重复执行；外部副作用需自行保证幂等。

## 失败与重试

`attempts` 记录当前 revision 的尝试次数，`failedAt` 与 `lastError` 保留最近失败信息。失败任务不会删除；成功提交后才确认删除。默认没有自动重试。处理器可显式声明 `retry: { maxAttempts: 3, delayMs: 5000 }`：maxAttempts 包含第一次执行，delayMs 至少 1000。未耗尽次数时原任务延后 availableAt，仍占队头；耗尽后置 failed。匹配与目录处理器均未启用该选项。

替换输入会给新 revision 单独计算尝试次数；若旧任务已 failed，保留失败信息直到运维显式恢复。数据库故障导致任务状态无法保存时，进程内停止该通道；修复数据库后重启 API，恢复未确认任务。

不提供前端 GraphQL 管理接口。组件恢复后，在 API 包目录、使用其现有配置执行以下维护命令；命令只创建数据库客户端，不启动 Nest、下载恢复或定时任务：

```bash
node dist/background-queue/cli.js status
node dist/background-queue/cli.js retry <job-id> <revision>
```

status 最多列出 100 个失败任务的编号、通道、revision、尝试次数及安全错误摘要，不打印 payload。retry 仅恢复所指定且 revision 仍一致的 failed 任务，重置尝试预算；运行中的消费者在下次检查继续。若是进程内存储故障屏障，仍需先重启 API。不要在组件仍故障时循环执行 retry。
