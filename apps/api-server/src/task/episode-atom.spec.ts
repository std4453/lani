import {
  atomTypes,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
  requestCancellation,
  retryWorkflow,
} from '@lani/workflow';
import { EpisodeAtom, entryCheckpoint } from './episode-atom';
import { AsyncAtom, Atoms, TaskInput } from './atom';
import { StoredTask, TaskStorePort, WorkflowRunner } from './workflow-runner';
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
  atoms.findImportFiles = new EpisodeAtom(atom);
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
      episodes: [1, 2].map((id) => ({
        id,
        taskId: 1,
        episodeId: id,
        position: id - 1,
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
      const entries = state.input.episodes!.map((entry) => ({
        ...entry,
        ...output.episodeOutputs?.find((e) => e.id === entry.id),
      }));
      state = {
        ...state,
        version: state.version + 1,
        workflow: parseWorkflow(next),
        input: { ...state.input, episodes: entries },
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
    currentStep(test.state().workflow).checkpoint.entries?.[1].completed,
  ).toBe(true);
  expect(test.state().input.episodes![0].importPath).toBe('/1.mkv');
  fail = false;
  await test.runner.transition(1, (flow) => retryWorkflow(flow, now));
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('succeeded');
  expect(
    run.mock.calls.filter(([, input]) => input.episodeId === 1),
  ).toHaveLength(1);
  expect(test.state().input.episodes!.map((e) => e.importPath)).toEqual([
    '/1.mkv',
    '/2.mkv',
  ]);
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
    1: { publicationClaimed: true, completed: true },
    2: { publicationClaimed: true, completed: true },
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
  expect(test.state().input.episodes!.every((e) => e.importPath === null)).toBe(
    true,
  );
});
it('旧单集检查点直接投影，新检查点不会混入其他项', () => {
  expect(entryCheckpoint({ publicationClaimed: true }, 3)).toEqual({
    publicationClaimed: true,
  });
  expect(entryCheckpoint({ entries: { 1: { completed: true } } }, 3)).toEqual(
    {},
  );
});
