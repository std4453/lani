# 下载任务流程协议

API 与 Admin 共享任务流程的 TypeScript 类型及 JSON 边界校验，不依赖 NestJS、Prisma 或 React。

任务保存创建时的有序流程快照。步骤数量、标识和顺序由后端定义；原子声明 `wants`，外层数组表示 AND，每个内层数组表示 OR。所有前置条件必须在该步骤之前满足。当前产物按原子类型保存在任务列中，因此同一流程不能重复使用同一原子类型。

`schemaVersion` 表示协议版本，`definitionVersion` 表示流程定义版本，任务行的 `version` 用于并发更新。取消意图一旦记录不可清除；取消失败使用普通失败状态，统一重试入口根据取消意图继续清理。旧任务的流程为 NULL，不转换为此协议。

```bash
rushx build
rushx test --runInBand
```
