import { Prisma } from '@lani/db';
import {
  AtomContext,
  CheckpointUpdate,
  ExecutionStopped,
  TaskInput,
  TaskOutput,
  Atoms,
} from './atom';
import {
  Checkpoint,
  currentStep,
  Workflow,
  isActive,
  parseWorkflow,
} from '@lani/workflow';

export type Output = TaskOutput;
export interface StoredTask {
  id: number;
  version: number;
  workflow: Workflow;
  input: TaskInput;
}
export interface TaskStorePort {
  read(id: number, tx?: Prisma.TransactionClient): Promise<StoredTask>;
  transaction<T>(
    id: number,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T>;
  commit(
    task: StoredTask,
    workflow: Workflow,
    output?: Output,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean>;
}
export class WorkflowRunner {
  private running = new Map<number, Promise<void>>();
  private wake = new Map<number, Set<() => void>>();
  private stopping = false;
  private restart = new Set<number>();
  constructor(
    private store: TaskStorePort,
    protected readonly atoms: Atoms,
    private onError: (error: unknown) => void,
  ) {}

  start(id: number): Promise<void> {
    this.wake.get(id)?.forEach((wake) => wake());
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
    for (const waiters of this.wake.values()) waiters.forEach((wake) => wake());
    await Promise.all(this.running.values());
  }
  async transition(id: number, change: (workflow: Workflow) => Workflow) {
    for (;;) {
      const task = await this.store.read(id);
      const next = change(task.workflow);
      if (next === task.workflow || (await this.store.commit(task, next)))
        return;
    }
  }
  private context(
    task: StoredTask,
    stepId: string,
    cancelling = false,
  ): AtomContext {
    const initial = task.workflow.steps.find((step) => step.id === stepId)!;
    const attempt = initial.attempt;
    let checkpoint = initial.checkpoint;
    const read = async (tx?: Prisma.TransactionClient) => {
      const latest = await this.store.read(task.id, tx);
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
    const checkActive = (latest: StoredTask) => {
      if (
        !cancelling &&
        (latest.workflow.cancellation ||
          latest.workflow.currentStepId !== stepId)
      )
        throw new ExecutionStopped();
    };
    const assertActive = async () => checkActive(await read());
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
          const waiters = this.wake.get(task.id) ?? new Set();
          waiters.add(wake);
          this.wake.set(task.id, waiters);
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
          this.wake.get(task.id)?.delete(wake!);
          if (!this.wake.get(task.id)?.size) this.wake.delete(task.id);
        }
      }
    };
    const updateCheckpoint = async (
      update: CheckpointUpdate,
      tx?: Prisma.TransactionClient,
    ) => {
      for (;;) {
        const latest = await read(tx);
        const next = parseWorkflow(latest.workflow);
        const step = next.steps.find((s) => s.id === stepId)!;
        const change = update({
          checkpoint: step.checkpoint,
          input: latest.input,
        });
        step.checkpoint = change.checkpoint;
        if (await this.store.commit(latest, next, change.output, tx)) {
          if (!tx) checkpoint = step.checkpoint;
          return;
        }
      }
    };
    const saveCheckpoint = (
      patch: Checkpoint,
      output?: TaskOutput,
      tx?: Prisma.TransactionClient,
    ) =>
      updateCheckpoint(
        ({ checkpoint }) => ({
          checkpoint: { ...checkpoint, ...patch },
          output,
        }),
        tx,
      );
    return {
      stepId,
      attempt,
      get checkpoint() {
        return checkpoint;
      },
      assertActive,
      transaction: async (operation) => {
        const committed = await this.store.transaction(task.id, async (tx) => {
          const latest = await read(tx);
          checkActive(latest);
          const value = await operation({
            tx,
            workflow: latest.workflow,
            input: latest.input,
            updateCheckpoint: (update) => updateCheckpoint(update, tx),
            saveCheckpoint: (patch, output) =>
              saveCheckpoint(patch, output, tx),
          });
          const saved = await read(tx);
          return {
            value,
            checkpoint: saved.workflow.steps.find((s) => s.id === stepId)!
              .checkpoint,
          };
        });
        // 回滚的事务不能把未落库的检查点暴露给后续执行。
        checkpoint = committed.checkpoint;
        return committed.value;
      },
      saveCheckpoint,
      updateCheckpoint,
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
  private async cancel(task: StoredTask) {
    const step = currentStep(task.workflow);
    try {
      // 已完成原子的资源也需要释放，但保留其成功展示状态。
      for (const item of [...task.workflow.steps].reverse()) {
        if (
          item.attempt === 0 ||
          task.workflow.cancellation!.completedAtoms.includes(item.id)
        )
          continue;
        await this.atoms[item.atom].cancel(
          task.id,
          task.input,
          this.context(task, item.id, true),
        );
        for (;;) {
          const latest = await this.store.read(task.id);
          if (latest.workflow.status !== 'cancelling') return;
          const next = parseWorkflow(latest.workflow);
          next.cancellation!.completedAtoms.push(item.id);
          if (await this.store.commit(latest, next)) break;
        }
      }
      for (;;) {
        const latest = await this.store.read(task.id);
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
      await this.fail(task.id, step.id, step.attempt, error, true);
    }
  }
  private async execute(id: number) {
    while (!this.stopping) {
      let task = await this.store.read(id);
      if (!isActive(task.workflow)) return;
      if (task.workflow.cancellation) {
        await this.cancel(task);
        return;
      }
      let step = currentStep(task.workflow);
      const recovering = step.status === 'running';
      try {
        const next = parseWorkflow(task.workflow);
        const claimed = currentStep(next);
        claimed.status = 'running';
        claimed.attempt += 1;
        claimed.startedAt = new Date().toISOString();
        delete claimed.finishedAt;
        if (!(await this.store.commit(task, next))) continue;
        task = await this.store.read(id);
        step = currentStep(task.workflow);
        const context = this.context(task, step.id);
        await context.assertActive();
        const atom = this.atoms[step.atom];
        const output = recovering
          ? await atom.recover(id, task.input, context)
          : await atom.run(id, task.input, context);
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
