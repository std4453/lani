import { Injectable } from '@nestjs/common';

/** 单 API 实例的启动屏障，初始化时即关闭；业务登记记录是唯一持久化进度。 */
@Injectable()
export class MediaWriteState {
  private phase: 'initializing' | 'ready' | 'failed' = 'initializing';
  private listeners: Array<() => Promise<void>> = [];
  completed = 0;
  total = 0;
  reason?: string;
  get ready() {
    return this.phase === 'ready';
  }
  status() {
    return {
      state: this.phase,
      completed: this.completed,
      total: this.total,
      reason: this.reason,
    };
  }
  assertReady() {
    if (!this.ready)
      throw new Error(
        'lani 正在登记历史媒体，暂时不能修改媒体文件，请稍后重试',
      );
  }
  onReady(run: () => Promise<void>) {
    this.listeners.push(run);
  }
  async open() {
    this.phase = 'ready';
    for (const listener of this.listeners) await listener();
  }
  fail(reason: string) {
    this.reason = reason;
    this.phase = 'failed';
  }
}
