import { Injectable } from '@nestjs/common';

/** 文件操作共用此短期串行边界；跨步骤发布归属仍由任务检查点保证。 */
@Injectable()
export class MediaOperations {
  private pending: Promise<unknown> = Promise.resolve();
  recovery?: () => Promise<void>;
  run<T>(operation: () => Promise<T>): Promise<T> {
    const run = async () => {
      await this.recovery?.();
      return operation();
    };
    const next = this.pending.then(run, run);
    this.pending = next.catch(() => undefined);
    return next;
  }
}
