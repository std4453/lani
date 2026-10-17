import {
  atomTypes,
  batchImportEntries,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
  requestCancellation,
  retryWorkflow,
} from '@lani/workflow';
import { BatchableEpisodeAtom } from './batchable-episode-atom';
import { AsyncAtom, AtomContext, Atoms, TaskInput } from './atom';
import { StoredTask, TaskStorePort, WorkflowRunner } from './workflow-runner';
class TestEpisodeAtom extends BatchableEpisodeAtom {
  readonly wants = [];
  constructor(private implementation: AsyncAtom) {
    super();
  }
  protected runEpisode(id: number, input: TaskInput, context: AtomContext) {
    return this.implementation.run(id, input, context);
  }
  protected recoverEpisode(id: number, input: TaskInput, context: AtomContext) {
    return this.implementation.recover(id, input, context);
  }
  protected cancelEpisode(id: number, input: TaskInput, context: AtomContext) {
    return this.implementation.cancel(id, input, context);
  }
}
const now = '2026-10-16T00:00:00Z';
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function setup(atom: AsyncAtom) {
  const atoms = Object.fromEntries(
    atomTypes.map((type) => [
      type,
      {
        wants: [],
        run: jest.fn(async () => ({})),
        recover: jest.fn(async () => ({})),
        cancel: jest.fn(),
      },
    ]),
  ) as unknown as Atoms;
  atoms.findImportFiles = new TestEpisodeAtom(atom);
  let state: StoredTask = {
    id: 1,
    version: 0,
    workflow: buildWorkflowSnapshot(
      [
        { id: 'find', atom: 'findImportFiles', title: '寻找' },
        { id: 'import', atom: 'importFile', title: '导入' },
      ],
      atoms,
      now,
    ),
    input: {
      id: 1,
      type: 'BATCH_IMPORT',
      sourcePath: null,
      episodeId: null,
      torrentLink: null,
      qbtTorrentHash: null,
      torrentTitle: null,
      downloadPath: null,
      importPath: null,
      filePath: null,
      nfoPath: null,
      jellyfinEpisodeId: null,
      batchEntries: [1, 2].map((id) => ({
        id: `entry-${id}`,
        episodeId: id,
        sourcePath: `/${id}.mkv`,
        importPath: null,
        filePath: null,
        nfoPath: null,
        jellyfinEpisodeId: null,
      })),
    } as TaskInput,
  };
  const store: TaskStorePort = {
    read: async () => JSON.parse(JSON.stringify(state)),
    transaction: jest.fn(),
    commit: async (previous, next, output = {}) => {
      if (state.version !== previous.version) return false;
      state = {
        ...state,
        version: state.version + 1,
        workflow: parseWorkflow(next),
        input: { ...state.input, ...output } as TaskInput,
      };
      return true;
    },
  };
  const runner = new WorkflowRunner(store, atoms, jest.fn());
  return { runner, store, atoms, state: () => state };
}
it('等待全部在途项；失败后不进入下一步，重试只执行失败项', async () => {
  const slow = deferred();
  const started = deferred();
  let fail = true;
  const run = jest.fn(async (_id, input: TaskInput) => {
    if (input.episodeId === 1) {
      started.resolve();
      await slow.promise;
      return { importPath: '/1.mkv' };
    }
    if (fail) throw new Error('missing file');
    return { importPath: '/2.mkv' };
  });
  const test = setup({ wants: [], recover: run, run, cancel: jest.fn() });
  const running = test.runner.start(1);
  await started.promise;
  expect(test.state().workflow.status).toBe('running');
  expect(test.atoms.importFile.run).not.toHaveBeenCalled();
  slow.resolve();
  await running;
  expect(test.state().workflow.status).toBe('failed');
  expect(
    currentStep(test.state().workflow).checkpoint.entries?.['entry-1']
      .completed,
  ).toBe(true);
  expect(
    batchImportEntries(test.state().input.batchEntries)[0].importPath,
  ).toBe('/1.mkv');
  fail = false;
  await test.runner.transition(1, (flow) => retryWorkflow(flow, now));
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('succeeded');
  expect(
    run.mock.calls.filter(([, input]) => input.episodeId === 1),
  ).toHaveLength(1);
  expect(
    batchImportEntries(test.state().input.batchEntries).map(
      (e) => e.importPath,
    ),
  ).toEqual(['/1.mkv', '/2.mkv']);
});
it('并发检查点合并保留双方字段，重启跳过已成功项', async () => {
  const run = jest.fn(async (_id, input: TaskInput, context) => {
    await context.saveCheckpoint({ publicationClaimed: true });
    return { importPath: input.sourcePath };
  });
  const test = setup({ wants: [], run, recover: run, cancel: jest.fn() });
  await test.runner.start(1);
  const entries = test.state().workflow.steps[0].checkpoint.entries!;
  expect(entries).toEqual({
    'entry-1': { publicationClaimed: true, completed: true },
    'entry-2': { publicationClaimed: true, completed: true },
  });
  const flow = parseWorkflow(test.state().workflow);
  flow.status = 'running';
  flow.currentStepId = 'find';
  flow.steps[0].status = 'running';
  delete flow.finishedAt;
  await test.store.commit(test.state(), flow);
  const restarted = new WorkflowRunner(test.store, test.atoms, jest.fn());
  await restarted.start(1);
  expect(run).toHaveBeenCalledTimes(2);
});
it('取消唤醒同一步骤所有等待项，迟到结果不能写入产物', async () => {
  const waiters = deferred();
  const late = deferred();
  let count = 0;
  const run = jest.fn(async (_id, _input, context) => {
    if (++count === 2) waiters.resolve();
    await context.waitFor(late.promise);
    return { importPath: '/late.mkv' };
  });
  const cancel = jest.fn(async () => undefined);
  const test = setup({ wants: [], run, recover: run, cancel });
  const running = test.runner.start(1);
  await waiters.promise;
  await test.runner.transition(1, (flow) => requestCancellation(flow, now));
  await test.runner.start(1);
  await running;
  expect(test.state().workflow.status).toBe('cancelled');
  expect(cancel).toHaveBeenCalledTimes(2);
  late.resolve();
  await Promise.resolve();
  expect(
    batchImportEntries(test.state().input.batchEntries).every(
      (e) => e.importPath === null,
    ),
  ).toBe(true);
});
it('单集任务直接复用根检查点，不增加条目或 completed 标记', async () => {
  const atom = {
    wants: [],
    run: jest.fn(async () => ({ filePath: '/single.mkv' })),
    recover: jest.fn(async () => ({})),
    cancel: jest.fn(),
  };
  const wrapper = new TestEpisodeAtom(atom);
  const input = { id: 1, type: 'IMPORT' } as TaskInput;
  const context = { checkpoint: { publicationClaimed: true } } as never;
  expect(await wrapper.run(1, input, context)).toEqual({
    filePath: '/single.mkv',
  });
  expect(atom.run).toHaveBeenCalledWith(1, input, context);
  await wrapper.recover(1, input, context);
  expect(atom.recover).toHaveBeenCalledWith(1, input, context);
  await wrapper.cancel(1, input, context);
  expect(atom.cancel).toHaveBeenCalledWith(1, input, context);
});
