# 单实例后台任务队列

队列名称、是否启用、处理器与重试策略由 API 代码注册，不维护定义表。当前清理通道常量在 `torrent-retention/policy.ts`；不使用数据库枚举，新增通道不需要迁移。只有 `background_jobs` 持久化工作。业务检查点由所属模块保存，不塞进通用队列。

## 生产与消费协议

持久化协议区分三个概念：

- `queueName` 标识代码注册的处理器及其调度通道。
- `key` 是该通道内未完成任务的合并键。成功后任务删除，同 key 可以再次入队；不提供历史记录或永久去重，不能把 key 当作永久幂等键。
- `revision` 仅表示输入被替换的次数，与 payload 格式版本无关。

业务 payload 在 JSON 内用 `version` 表示格式版本，由业务处理器兼容。清理任务的新输入是 `{ version: 1, hashes: [...] }`；已有无 version 的 `{ hashes: [...] }` 按 v1 读取。未知版本明确失败并保留任务，不执行下载器操作；应升级处理器或修复输入后再显式恢复，不静默删除。hash 有效性校验对新旧输入都生效。

生产者直接从 `producer.ts` 引入 `enqueueJob(tx, queueName, key, payload, availableAt?)`，在业务事务内调用，无需依赖消费者服务。payload 必须可 JSON 序列化。同 key 合并为最新输入、增加 revision 并保留首次排队位置；替换失败任务不解除失败屏障。事务回滚不会留下孤立工作。

协议类型 `QueueHandler<TPayload>`、`QueueJob<TPayload>`、`QueueCommit`、`QueueRetry` 及 `QueueWaiting` 从 `types.ts` 引入；`index.service.ts` 负责消费、恢复和调度。业务类实现 `QueueHandler<TPayload>`，添加 `@Injectable()` 和 `@QueueConsumer(queueName)` 并列入所属模块的 providers；队列模块通过 NestJS Discovery 自动发现单例处理器，在启动恢复前完成注册。请求作用域、瞬态处理器和重复通道名会阻止启动。处理器包含 `enabled`、`ready?`、`execute`、`settled?`、`retry?`，`ready`／`execute` 的 `job.payload` 保持具体业务类型。数据库 JSON 在注册边界统一转换，业务按需校验格式。`ready` 返回 false 或执行抛 `QueueWaiting` 表示依赖等待，保留队头，不记为失败；`execute` 在事务外执行耗时工作，返回 `QueueCommit` 提交函数；该函数仅执行数据库写入，不能包含下载请求、文件操作等外部副作用。结果提交与删除当前 revision 的任务在同一事务；输入已被替换则整体回滚旧结果。`settled` 同步释放进程内资源，不能抛异常。

例如清理通道的注册方式如下，业务服务无需注入队列消费者或手动调用 register：

```ts
@Injectable()
@QueueConsumer(RETENTION_QUEUE)
export class TorrentRetentionService implements QueueHandler<TorrentRetentionPayload> {
  get enabled() { return config.downloadClient.qbittorrent.retention.enabled; }
  async execute(job: QueueJob<TorrentRetentionPayload>): Promise<QueueCommit> {
    // 校验输入并执行可重放的外部工作。
    return async (tx) => { /* 仅提交数据库写入 */ };
  }
}
```

`QueueConsumer` 从 `consumer.decorator.ts` 引入；所属模块需导入 `BackgroundQueueModule`。内部 `register<TPayload>` 仍统一处理类型边界和方法绑定，保留类实例的 this 与 getter。

每个通道按 ID FIFO，每轮最多 50 条，每 5 秒检查一次，生产者可在事务提交后主动 wake。等待、延迟重试和失败的队头都会阻塞本通道后续任务，其他通道仍能独立执行和提交。仅支持单 API 消费实例；不提供租约或多副本抢占。重启恢复 running 为 pending，处理器必须容许重复执行；执行过的外部副作用可能因重启或提交回滚再次发生，业务需自行保证幂等。

## 失败与重试

`attempts` 记录当前 revision 的尝试次数，`failedAt` 与 `lastError` 保留最近失败信息。失败任务不会删除；成功提交后才确认删除。默认没有自动重试。处理器可显式声明 `retry: { maxAttempts: 3, delayMs: 5000 }`：maxAttempts 包含第一次执行，delayMs 至少 1000。未耗尽次数时原任务延后 availableAt，仍占队头；耗尽后置 failed。种子清理处理器未启用该选项。

替换输入会给新 revision 单独计算尝试次数；若旧任务已 failed，保留失败信息直到运维显式恢复。数据库故障导致任务状态无法保存时，进程内停止该通道；修复数据库后重启 API，恢复未确认任务。

不提供独立维护 CLI 或前端 GraphQL 管理接口。失败任务保留在数据库，修复输入或代码后再由业务显式恢复。
