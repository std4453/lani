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
  /** 独立任务可跳过终止失败，保留失败记录供手动恢复；默认阻塞本通道。 */
  continueOnFailure?: boolean;
  /** 默认只尝试一次；需自动重试的处理器显式声明有限次数和间隔。 */
  retry?: QueueRetry;
  ready?(job: QueueJob<TPayload>): Promise<boolean>;
  execute(job: QueueJob<TPayload>): Promise<QueueCommit>;
  /** 执行和提交结束后释放进程内资源，不能抛出异常。 */
  settled?(): void;
}
/** 依赖尚未就绪，保留队头；这不是执行失败。 */
export class QueueWaiting extends Error {}
