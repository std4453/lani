import { AtomType, Checkpoint, Wants, Workflow } from '@lani/workflow';
import { Prisma, Task } from '@lani/db';

export type TaskInput = Pick<
  Task,
  | 'id'
  | 'episodeId'
  | 'torrentLink'
  | 'qbtTorrentHash'
  | 'torrentTitle'
  | 'downloadPath'
  | 'importPath'
  | 'filePath'
  | 'nfoPath'
  | 'jellyfinEpisodeId'
>;
export type TaskOutput = Partial<
  Omit<TaskInput, 'id' | 'episodeId' | 'torrentLink'>
>;
export interface AtomTransaction {
  tx: Prisma.TransactionClient;
  workflow: Workflow;
  input: TaskInput;
  saveCheckpoint(checkpoint: Checkpoint, output?: TaskOutput): Promise<void>;
}
export interface AtomContext {
  readonly stepId: string;
  readonly attempt: number;
  readonly checkpoint: Checkpoint;
  assertActive(): Promise<void>;
  transaction<T>(
    operation: (transaction: AtomTransaction) => Promise<T>,
  ): Promise<T>;
  saveCheckpoint(checkpoint: Checkpoint, output?: TaskOutput): Promise<void>;
  wait(milliseconds: number): Promise<void>;
  waitFor<T>(operation: Promise<T>): Promise<T>;
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
