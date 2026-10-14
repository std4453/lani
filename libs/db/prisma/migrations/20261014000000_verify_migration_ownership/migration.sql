-- 临时部署验收：验证现有表 DDL 和新对象创建权限，全部业务变更在事务内回滚。
-- 本 PR 仅用于测试环境验收，不应合入长期分支。
BEGIN;
SET LOCAL lock_timeout = '10s';
ALTER TABLE public.episodes ADD COLUMN __migration_owner_probe integer;
CREATE TABLE public.__migration_owner_probe (id serial PRIMARY KEY);
ROLLBACK;
