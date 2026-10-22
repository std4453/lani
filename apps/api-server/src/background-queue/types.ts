import { BackgroundJob, Prisma } from '@lani/db';

export type QueueCommit = (tx: Prisma.TransactionClient) => Promise<void>;
export interface QueueRetry {
  maxAttempts: number;
  delayMs: number;
}
export type QueueJob<TPayload> = Omit<BackgroundJob, 'payload'> & {
  payload: TPayload;
};
export interface QueueHandler<TPayload> {
  enabled: boolean;
  /** 默认只尝试一次；需自动重试的处理器显式声明有限次数和间隔。 */
  retry?: QueueRetry;
  ready?(job: QueueJob<TPayload>): Promise<boolean>;
  execute(job: QueueJob<TPayload>): Promise<QueueCommit>;
  /** 执行和提交结束后释放进程内资源，不能抛出异常。 */
  settled?(): void;
}
/** 依赖尚未就绪，保留队头；这不是执行失败。 */
export class QueueWaiting extends Error {}
