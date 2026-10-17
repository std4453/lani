import {
  Checkpoint,
  EntryCheckpoint,
  BatchImportEntry,
  batchImportEntries,
  Workflow,
} from '@lani/workflow';
import {
  AsyncAtom,
  AtomContext,
  CheckpointUpdate,
  ExecutionStopped,
  TaskInput,
  TaskOutput,
} from './atom';

/** 单集任务保持原检查点；批量任务只读取自己的内部条目。 */
export function entryCheckpoint(
  checkpoint: Checkpoint,
  entryId: string,
): EntryCheckpoint {
  return checkpoint.entries?.[entryId] ?? {};
}
function entryInput(input: TaskInput, entry: BatchImportEntry): TaskInput {
  return { ...input, ...entry, id: input.id, batchEntries: null };
}

/** 逐集原子共享一个步骤；所有在途项收敛后才能推进或报告失败。 */
export abstract class BatchableEpisodeAtom extends AsyncAtom {
  protected abstract runEpisode(
    id: number,
    input: TaskInput,
    context: AtomContext,
  ): Promise<TaskOutput>;

  protected recoverEpisode(id: number, input: TaskInput, context: AtomContext) {
    return this.runEpisode(id, input, context);
  }

  protected cancelEpisode(id: number, input: TaskInput, context: AtomContext) {
    return super.cancel(id, input, context);
  }

  private context(parent: AtomContext, entry: BatchImportEntry): AtomContext {
    const wrapUpdate =
      (update: CheckpointUpdate): CheckpointUpdate =>
      ({ checkpoint, input }) => {
        const entries = batchImportEntries(input.batchEntries);
        const current = entries.find((item) => item.id === entry.id);
        if (!current) throw new Error('批量导入条目不存在');
        const change = update({
          checkpoint: entryCheckpoint(checkpoint, entry.id),
          input: entryInput(input, current),
        });
        return {
          checkpoint: {
            ...checkpoint,
            entries: { ...checkpoint.entries, [entry.id]: change.checkpoint },
          },
          output: change.output
            ? {
                batchEntries: entries.map((item) =>
                  item.id === entry.id
                    ? { ...item, ...change.output }
                    : { ...item },
                ),
              }
            : undefined,
        };
      };
    const merge =
      (patch: EntryCheckpoint, output?: TaskOutput): CheckpointUpdate =>
      ({ checkpoint }) => ({ checkpoint: { ...checkpoint, ...patch }, output });
    return {
      ...parent,
      entryId: entry.id,
      get checkpoint() {
        return entryCheckpoint(parent.checkpoint, entry.id);
      },
      updateCheckpoint: (update) => parent.updateCheckpoint(wrapUpdate(update)),
      saveCheckpoint: (patch, output) =>
        parent.updateCheckpoint(wrapUpdate(merge(patch, output))),
      transaction: (operation) =>
        parent.transaction(({ tx, workflow, input, updateCheckpoint }) => {
          const current = batchImportEntries(input.batchEntries).find(
            (item) => item.id === entry.id,
          );
          if (!current) throw new Error('批量导入条目不存在');
          const projected: Workflow = {
            ...workflow,
            steps: workflow.steps.map((step) => ({
              ...step,
              checkpoint: entryCheckpoint(step.checkpoint, entry.id),
            })),
          };
          return operation({
            tx,
            workflow: projected,
            input: entryInput(input, current),
            updateCheckpoint: (update) => updateCheckpoint(wrapUpdate(update)),
            saveCheckpoint: (patch, output) =>
              updateCheckpoint(wrapUpdate(merge(patch, output))),
          });
        }),
    };
  }

  async run(
    id: number,
    input: TaskInput,
    parent: AtomContext,
  ): Promise<TaskOutput> {
    if (input.type !== 'BATCH_IMPORT')
      return this.runEpisode(id, input, parent);
    const entries = batchImportEntries(input.batchEntries);
    if (!entries.length) throw new Error('批量导入任务没有条目');
    const results = await Promise.allSettled(
      entries.map(async (entry) => {
        const context = this.context(parent, entry);
        if (entryCheckpoint(parent.checkpoint, entry.id).completed) return;
        await context.assertActive();
        const output = await this.recoverEpisode(
          id,
          entryInput(input, entry),
          context,
        );
        await context.updateCheckpoint(({ checkpoint }) => ({
          checkpoint: { ...checkpoint, completed: true } as EntryCheckpoint,
          output,
        }));
      }),
    );
    const errors = results.flatMap((r, i) =>
      r.status === 'rejected' ? [{ error: r.reason, entry: entries[i] }] : [],
    );
    if (errors.some(({ error }) => error instanceof ExecutionStopped))
      throw new ExecutionStopped();
    if (errors.length)
      throw new Error(
        errors
          .map(
            ({ error, entry }) =>
              `剧集 #${entry.episodeId ?? '?'}${
                entry.sourcePath ? `（${entry.sourcePath}）` : ''
              }：${error instanceof Error ? error.message : String(error)}`,
          )
          .join('\n'),
      );
    return {};
  }

  recover(id: number, input: TaskInput, parent: AtomContext) {
    return input.type === 'BATCH_IMPORT'
      ? this.run(id, input, parent)
      : this.recoverEpisode(id, input, parent);
  }

  async cancel(id: number, input: TaskInput, parent: AtomContext) {
    if (input.type !== 'BATCH_IMPORT')
      return this.cancelEpisode(id, input, parent);
    const results = await Promise.allSettled(
      batchImportEntries(input.batchEntries).map((entry) =>
        this.cancelEpisode(
          id,
          entryInput(input, entry),
          this.context(parent, entry),
        ),
      ),
    );
    const errors = results.flatMap((r) =>
      r.status === 'rejected' ? [String(r.reason)] : [],
    );
    if (errors.length) throw new Error(errors.join('\n'));
  }
}
