import { Global, Injectable, Module } from '@nestjs/common';
import { LaniError } from '@/utils/error';

/** 单 API 实例的启动准入；只有上层初始化协调器可以开放。 */
@Injectable()
export class WriteGate {
  private opened = false;
  get ready() {
    return this.opened;
  }
  assertReady() {
    if (!this.opened)
      throw new LaniError('lani 正在初始化，暂时不能修改媒体文件，请稍后重试');
  }
  open() {
    this.opened = true;
  }
  fail() {
    this.opened = false;
  }
}

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

@Global()
@Module({
  providers: [WriteGate, MediaOperations],
  exports: [WriteGate, MediaOperations],
})
export class ApplicationStateModule {}
