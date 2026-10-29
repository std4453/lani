import { AtomType, Checkpoint, Wants, Workflow } from '@lani/workflow';
import { Prisma, Task } from '@lani/db';

export type TaskInput = Pick<
  Task,
  | 'id'
  | 'type'
  | 'sourcePath'
  | 'batchEntries'
  | 'episodeId'
  | 'torrentLink'
  | 'qbtTorrentHash'
  | 'torrentTitle'
  | 'downloadPath'
  | 'importPath'
  | 'filePath'
  | 'nfoPath'
  | 'jellyfinEpisodeId'
> & { downloadTimeoutMinutes?: number | null };
export type TaskOutput = Partial<
  Pick<
    TaskInput,
    | 'qbtTorrentHash'
    | 'torrentTitle'
    | 'downloadPath'
    | 'importPath'
    | 'filePath'
    | 'nfoPath'
    | 'jellyfinEpisodeId'
  >
> & { batchEntries?: Prisma.InputJsonValue };
/** 在任务最新快照上计算更新；调用方负责自己的数据结构。 */
export type CheckpointUpdate = (state: {
  checkpoint: Checkpoint;
  input: TaskInput;
}) => { checkpoint: Checkpoint; output?: TaskOutput };
export interface AtomTransaction {
  tx: Prisma.TransactionClient;
  workflow: Workflow;
  input: TaskInput;
  updateCheckpoint(update: CheckpointUpdate): Promise<void>;
  saveCheckpoint(checkpoint: Checkpoint, output?: TaskOutput): Promise<void>;
}
export interface AtomContext {
  readonly entryId?: string;
  readonly stepId: string;
  readonly attempt: number;
  readonly checkpoint: Checkpoint;
  assertActive(): Promise<void>;
  transaction<T>(
    operation: (transaction: AtomTransaction) => Promise<T>,
  ): Promise<T>;
  updateCheckpoint(update: CheckpointUpdate): Promise<void>;
  saveCheckpoint(checkpoint: Checkpoint, output?: TaskOutput): Promise<void>;
  wait(milliseconds: number): Promise<void>;
  waitFor<T>(operation: Promise<T>): Promise<T>;
  requestCancellation?(reason: string, code: 'timeout' | 'baha'): Promise<void>;
}
export class ExecutionStopped extends Error {}
export abstract class AsyncAtom {
  abstract readonly wants: Wants;
  abstract run(
    id: number,
    input: TaskInput,
    context: AtomContext,
  ): Promise<TaskOutput>;
  // 默认恢复复用幂等执行，有副作用的原子通过检查点确认已完成的部分。
  recover(
    id: number,
    input: TaskInput,
    context: AtomContext,
  ): Promise<TaskOutput> {
    return this.run(id, input, context);
  }
  async cancel(
    _id: number,
    _input: TaskInput,
    _context: AtomContext,
  ): Promise<void> {
    // 没有外部资源的原子无需额外清理。
    void _id;
    void _input;
    void _context;
  }
}
export type Atoms = Record<AtomType, AsyncAtom>;
