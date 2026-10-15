import { AtomType, Checkpoint, Wants } from '@lani/download-workflow';

export type PartialOutput<
  D extends { steps: Record<string, { output: unknown }> },
> = {
  [K in keyof D['steps']]?: D['steps'][K]['output'];
};
export type StepInput<
  D extends { params: unknown; steps: Record<string, { output: unknown }> },
> = {
  id: number;
  params: D['params'];
  steps: PartialOutput<D>;
};
export interface AtomContext {
  readonly stepId: string;
  readonly attempt: number;
  readonly checkpoint: Checkpoint;
  assertActive(): Promise<void>;
  saveCheckpoint(checkpoint: Checkpoint): Promise<void>;
  wait(milliseconds: number): Promise<void>;
  waitFor<T>(operation: Promise<T>): Promise<T>;
}
export class ExecutionStopped extends Error {}
export abstract class AsyncAtom<
  D extends { params: unknown; steps: Record<string, { output: unknown }> },
  K extends keyof D['steps'] & AtomType,
> {
  abstract readonly wants: Wants;
  abstract run(
    id: number,
    input: StepInput<D>,
    context: AtomContext,
  ): Promise<D['steps'][K]['output']>;
  // 默认恢复复用幂等执行，带外部副作用的原子通过检查点确认已完成的部分。
  async recover(
    id: number,
    input: StepInput<D>,
    context: AtomContext,
  ): Promise<D['steps'][K]['output']> {
    return this.run(id, input, context);
  }
  async cancel(
    _id: number,
    _input: StepInput<D>,
    _context: AtomContext,
  ): Promise<void> {
    // 没有外部资源的原子无需额外清理。
    void _id;
    void _input;
    void _context;
  }
}
