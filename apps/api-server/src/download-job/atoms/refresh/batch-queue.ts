export interface QueueEntry<I, O> {
  input: I;
  resolve(value: O): void;
  reject(error: unknown): void;
}
/** 按固定周期合批；手动刷新复用在途批次，移除后的迟到结果不交给新尝试。 */
export abstract class BatchQueue<I, O> {
  protected entries = new Map<number, QueueEntry<I, O>>();
  private pending?: Promise<number>;
  enqueue(id: number, input: I): Promise<O> {
    const result = new Promise<O>((resolve, reject) =>
      this.entries.set(id, { input, resolve, reject }),
    );
    return result;
  }
  onApplicationShutdown() {
    this.entries.clear();
  }
  remove(id: number) {
    this.entries.delete(id);
  }
  refresh(): Promise<number> {
    if (this.pending) return this.pending;
    const entries = new Map(this.entries);
    if (!entries.size) return Promise.resolve(0);
    const pending = this.refreshBatch(entries)
      .then(() => entries.size)
      .finally(() => {
        this.pending = undefined;
      });
    this.pending = pending;
    return pending;
  }
  protected settle(id: number, entry: QueueEntry<I, O>, result: O | Error) {
    if (this.entries.get(id) !== entry) return;
    this.entries.delete(id);
    if (result instanceof Error) entry.reject(result);
    else entry.resolve(result);
  }
  protected abstract refreshBatch(
    entries: Map<number, QueueEntry<I, O>>,
  ): Promise<void>;
}
