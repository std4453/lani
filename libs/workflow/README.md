# `@lani/workflow`

API 与 Admin 共享的任务流程类型、Joi 校验和列表摘要工具。定义按步骤顺序组织；依赖 wants 的外层数组表示 AND，内层数组表示 OR，所有前置条件须在当前步骤之前满足。

使用时由 `buildWorkflowSnapshot` 校验定义并生成快照，列表调用 `summarizeWorkflow` 获取结构化摘要。版本和恢复语义见[设计笔记](DESIGN.md)。
