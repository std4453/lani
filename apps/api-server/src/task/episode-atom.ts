import { Checkpoint, Workflow } from '@lani/workflow';
import { TaskEpisode } from '@lani/db';
import {
  AsyncAtom,
  AtomContext,
  ExecutionStopped,
  TaskInput,
  TaskOutput,
} from './atom';

/** 旧快照的单集检查点无需回填；新快照按关联记录隔离检查点。 */
export function entryCheckpoint(
  checkpoint: Checkpoint,
  entryId?: number,
): Checkpoint {
  return entryId === undefined
    ? checkpoint
    : checkpoint.entries?.[entryId] ?? (checkpoint.entries ? {} : checkpoint);
}

function entryInput(input: TaskInput, entry: TaskEpisode): TaskInput {
  return { ...input, ...entry, id: input.id, episodes: undefined };
}

/** 逐集原子共享一个步骤；所有在途项收敛后才能推进或报告失败。 */
export class EpisodeAtom extends AsyncAtom {
  get wants() {
    return this.atom.wants;
  }
  constructor(private atom: AsyncAtom) {
    super();
  }

  private context(parent: AtomContext, entry: TaskEpisode): AtomContext {
    const wrapOutput = (output?: TaskOutput): TaskOutput => ({
      episodeOutputs: [{ id: entry.id, ...output }],
    });
    const wrap = (patch: Checkpoint): Checkpoint => ({
      entries: { [entry.id]: patch },
    });
    return {
      ...parent,
      entryId: entry.id,
      get checkpoint() {
        return entryCheckpoint(parent.checkpoint, entry.id);
      },
      saveCheckpoint: (patch, output) =>
        parent.saveCheckpoint(wrap(patch), wrapOutput(output)),
      transaction: (operation) =>
        parent.transaction(({ tx, workflow, input, saveCheckpoint }) => {
          const currentEntry = input.episodes?.find((e) => e.id === entry.id);
          if (!currentEntry) throw new Error('任务关联已被删除');
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
            input: entryInput(input, currentEntry),
            saveCheckpoint: (patch, output) =>
              saveCheckpoint(wrap(patch), wrapOutput(output)),
          });
        }),
    };
  }

  async run(
    id: number,
    input: TaskInput,
    parent: AtomContext,
  ): Promise<TaskOutput> {
    if (!input.episodes?.length) throw new Error('任务没有关联剧集');
    const results = await Promise.allSettled(
      input.episodes.map(async (entry) => {
        const context = this.context(parent, entry);
        if (context.checkpoint.completed) return;
        await context.assertActive();
        const output = await this.atom.recover(
          id,
          entryInput(input, entry),
          context,
        );
        await context.saveCheckpoint({ completed: true }, output);
      }),
    );
    const errors = results.flatMap((r, i) =>
      r.status === 'rejected'
        ? [{ error: r.reason, entry: input.episodes![i] }]
        : [],
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

  async cancel(id: number, input: TaskInput, parent: AtomContext) {
    const results = await Promise.allSettled(
      (input.episodes ?? []).map((entry) =>
        this.atom.cancel(
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
