import {
  AtomContext,
  AsyncAtom,
  ExecutionStopped,
  StepInput,
  PartialOutput,
} from './atom';
export interface WorkflowDefinition {
  params: unknown;
  steps: Record<AtomType, { output: unknown }>;
}
import {
  AtomType,
  Checkpoint,
  currentStep,
  DownloadWorkflow,
  isActive,
  parseWorkflow,
} from '@lani/download-workflow';

export type Output<D extends WorkflowDefinition> = PartialOutput<D>;
export interface StoredWorkflow<D extends WorkflowDefinition> {
  id: number;
  version: number;
  workflow: DownloadWorkflow;
  input: StepInput<D>;
}
export interface WorkflowStore<D extends WorkflowDefinition> {
  read(id: number): Promise<StoredWorkflow<D>>;
  commit(
    job: StoredWorkflow<D>,
    workflow: DownloadWorkflow,
    output?: Output<D>,
  ): Promise<boolean>;
}
export type Atoms<D extends WorkflowDefinition> = {
  [K in AtomType]: AsyncAtom<D, K>;
};
export interface TaskRuntime {
  start(id: number): Promise<void>;
  stop(): Promise<void>;
  transition(
    id: number,
    change: (workflow: DownloadWorkflow) => DownloadWorkflow,
  ): Promise<void>;
}
export class WorkflowRunner<D extends WorkflowDefinition>
  implements TaskRuntime
{
  private running = new Map<number, Promise<void>>();
  private wake = new Map<number, () => void>();
  private stopping = false;
  private restart = new Set<number>();
  constructor(
    private store: WorkflowStore<D>,
    protected readonly atoms: Atoms<D>,
    private onError: (error: unknown) => void,
  ) {}

  start(id: number): Promise<void> {
    this.wake.get(id)?.();
    const existing = this.running.get(id);
    if (existing) {
      this.restart.add(id);
      return existing;
    }
    if (this.stopping) return Promise.resolve();
    const running = this.execute(id)
      .catch(this.onError)
      .finally(() => {
        this.running.delete(id);
        this.wake.delete(id);
        if (this.restart.delete(id) && !this.stopping) void this.start(id);
      });
    this.running.set(id, running);
    return running;
  }
  async stop() {
    this.stopping = true;
    for (const wake of this.wake.values()) wake();
    await Promise.all(this.running.values());
  }
  async transition(
    id: number,
    change: (workflow: DownloadWorkflow) => DownloadWorkflow,
  ) {
    for (;;) {
      const job = await this.store.read(id);
      const next = change(job.workflow);
      if (next === job.workflow || (await this.store.commit(job, next))) return;
    }
  }
  private context(
    job: StoredWorkflow<D>,
    stepId: string,
    cancelling = false,
  ): AtomContext {
    const initial = job.workflow.steps.find((step) => step.id === stepId)!;
    const attempt = initial.attempt;
    let checkpoint = initial.checkpoint;
    const read = async () => {
      const latest = await this.store.read(job.id);
      const step = latest.workflow.steps.find((s) => s.id === stepId);
      if (
        this.stopping ||
        !step ||
        step.attempt !== attempt ||
        !isActive(latest.workflow)
      )
        throw new ExecutionStopped();
      return latest;
    };
    const assertActive = async () => {
      const latest = await read();
      if (
        !cancelling &&
        (latest.workflow.cancellation ||
          latest.workflow.currentStepId !== stepId)
      )
        throw new ExecutionStopped();
    };
    const waitFor = async <T>(operation: Promise<T>): Promise<T> => {
      const interrupted = Symbol('interrupted');
      // 立即接住批次失败；取消可能在检查活动状态期间结束等待。
      const observed = operation.then(
        (value) => ({ ok: true as const, value }),
        (error) => ({ ok: false as const, error }),
      );
      for (;;) {
        let wake: () => void;
        const signal = new Promise<typeof interrupted>((resolve) => {
          wake = () => resolve(interrupted);
          this.wake.set(job.id, wake);
        });
        try {
          await assertActive();
          const result = await Promise.race([observed, signal]);
          await assertActive();
          if (result !== interrupted) {
            if (!result.ok) throw result.error;
            return result.value;
          }
        } finally {
          if (this.wake.get(job.id) === wake!) this.wake.delete(job.id);
        }
      }
    };
    return {
      stepId,
      attempt,
      get checkpoint() {
        return checkpoint;
      },
      assertActive,
      saveCheckpoint: async (patch: Checkpoint) => {
        for (;;) {
          const latest = await read();
          const next = parseWorkflow(latest.workflow);
          const step = next.steps.find((s) => s.id === stepId)!;
          step.checkpoint = { ...step.checkpoint, ...patch };
          if (await this.store.commit(latest, next)) {
            checkpoint = step.checkpoint;
            return;
          }
        }
      },
      waitFor,
      wait: async (milliseconds) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await waitFor(
            new Promise<void>((resolve) => {
              timer = setTimeout(resolve, milliseconds);
            }),
          );
        } finally {
          if (timer) clearTimeout(timer);
        }
      },
    };
  }
  private async fail(
    id: number,
    stepId: string,
    attempt: number,
    error: unknown,
    cancelling: boolean,
  ) {
    for (;;) {
      const latest = await this.store.read(id);
      if (!isActive(latest.workflow)) return;
      const step = currentStep(latest.workflow);
      if (
        step.id !== stepId ||
        step.attempt !== attempt ||
        !!latest.workflow.cancellation !== cancelling
      )
        return;
      const next = parseWorkflow(latest.workflow);
      const now = new Date().toISOString();
      next.status = 'failed';
      next.finishedAt = now;
      currentStep(next).status = 'failed';
      currentStep(next).finishedAt = now;
      next.error = {
        operation: cancelling ? 'cancel' : 'execute',
        stepId,
        message: error instanceof Error ? error.message : '任务执行失败',
        at: now,
      };
      if (await this.store.commit(latest, next)) return;
    }
  }
  private async cancel(job: StoredWorkflow<D>) {
    const step = currentStep(job.workflow);
    try {
      // 已完成原子的资源也需要释放，但保留其成功展示状态。
      for (const item of [...job.workflow.steps].reverse()) {
        if (
          item.attempt === 0 ||
          job.workflow.cancellation!.completedAtoms.includes(item.id)
        )
          continue;
        await this.atoms[item.atom].cancel(
          job.id,
          job.input,
          this.context(job, item.id, true),
        );
        for (;;) {
          const latest = await this.store.read(job.id);
          if (latest.workflow.status !== 'cancelling') return;
          const next = parseWorkflow(latest.workflow);
          next.cancellation!.completedAtoms.push(item.id);
          if (await this.store.commit(latest, next)) break;
        }
      }
      for (;;) {
        const latest = await this.store.read(job.id);
        if (latest.workflow.status !== 'cancelling') return;
        const next = parseWorkflow(latest.workflow);
        const now = new Date().toISOString();
        next.status = 'cancelled';
        next.finishedAt = now;
        currentStep(next).status = 'cancelled';
        currentStep(next).finishedAt = now;
        if (await this.store.commit(latest, next)) return;
      }
    } catch (error) {
      if (this.stopping) return;
      await this.fail(job.id, step.id, step.attempt, error, true);
    }
  }
  private async execute(id: number) {
    while (!this.stopping) {
      let job = await this.store.read(id);
      if (!isActive(job.workflow)) return;
      if (job.workflow.cancellation) {
        await this.cancel(job);
        return;
      }
      let step = currentStep(job.workflow);
      const recovering = step.status === 'running';
      try {
        const next = parseWorkflow(job.workflow);
        const claimed = currentStep(next);
        claimed.status = 'running';
        claimed.attempt += 1;
        claimed.startedAt = new Date().toISOString();
        delete claimed.finishedAt;
        if (!(await this.store.commit(job, next))) continue;
        job = await this.store.read(id);
        step = currentStep(job.workflow);
        const context = this.context(job, step.id);
        await context.assertActive();
        const atom = this.atoms[step.atom];
        const output: Output<D> = {};
        output[step.atom] = recovering
          ? await atom.recover(id, job.input, context)
          : await atom.run(id, job.input, context);
        for (;;) {
          const latest = await this.store.read(id);
          if (latest.workflow.cancellation) break;
          const current = currentStep(latest.workflow);
          if (
            latest.workflow.status !== 'running' ||
            current.id !== step.id ||
            current.attempt !== step.attempt
          )
            return;
          const finished = parseWorkflow(latest.workflow);
          const now = new Date().toISOString();
          currentStep(finished).status = 'succeeded';
          currentStep(finished).finishedAt = now;
          const index = finished.steps.findIndex((s) => s.id === step.id);
          if (index + 1 < finished.steps.length)
            finished.currentStepId = finished.steps[index + 1].id;
          else {
            finished.status = 'succeeded';
            finished.finishedAt = now;
          }
          if (await this.store.commit(latest, finished, output)) break;
        }
      } catch (error) {
        if (this.stopping) return;
        const latest = await this.store.read(id);
        if (latest.workflow.cancellation) continue;
        if (error instanceof ExecutionStopped) return;
        await this.fail(id, step.id, step.attempt, error, false);
        return;
      }
    }
  }
}
