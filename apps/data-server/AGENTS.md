# Data Server 开发约束

PostGraphile 依赖的 GraphQL 必须与本包使用同一版本，多个版本的运行时对象不能混用。升级任一依赖时检查解析结果和 Federation schema composition。

数据库字段、唯一约束及 Smart Comment 会改变暴露的 GraphQL schema；修改后同时核对 Gateway 组合及 Admin 生成类型。
