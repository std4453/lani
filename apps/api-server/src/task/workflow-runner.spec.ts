import {
  atomTypes,
  AtomType,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
  requestCancellation,
  retryWorkflow,
} from '@lani/download-workflow';
import {
  Atoms as WorkflowAtoms,
  Output as WorkflowOutput,
  StoredWorkflow as Stored,
  WorkflowRunner,
  WorkflowStore as Store,
  WorkflowDefinition,
} from '@/task/workflow-runner';
import { AtomContext, ExecutionStopped } from '@/task/atom';
type Atoms = WorkflowAtoms<WorkflowDefinition>;
type Output = WorkflowOutput<WorkflowDefinition>;
type StoredWorkflow = Stored<WorkflowDefinition>;
type WorkflowStore = Store<WorkflowDefinition>;
const now = '2026-10-14T12:00:00Z';
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function setup(types: AtomType[] = ['submitDownload', 'download']) {
  const atoms = Object.fromEntries(
    atomTypes.map((type) => [
      type,
      {
        wants: [],
        run: jest.fn(async () => ({})),
        recover: jest.fn(async () => ({})),
        cancel: jest.fn(async () => undefined),
      },
    ]),
  ) as unknown as Atoms;
  let state: StoredWorkflow = {
    id: 1,
    version: 0,
    workflow: buildWorkflowSnapshot(
      types.map((atom) => ({ id: atom, atom, title: atom })),
      atoms,
      now,
    ),
    input: {
      id: 1,
      params: { episodeId: 1, torrentLink: 'magnet:test' },
      steps: {},
    },
  };
  let completions = 0;
  const store: WorkflowStore = {
    read: async () => ({
      ...state,
      workflow: parseWorkflow(JSON.parse(JSON.stringify(state.workflow))),
    }),
    commit: async (previous, workflow, output: Output = {}) => {
      if (previous.version !== state.version) return false;
      if (workflow.status === 'succeeded') ++completions;
      state = {
        ...state,
        version: state.version + 1,
        workflow: parseWorkflow(workflow),
        input: { ...state.input, steps: { ...state.input.steps, ...output } },
      };
      return true;
    },
  };
  const errors = jest.fn();
  const runner = new WorkflowRunner(store, atoms, errors);
  return {
    atoms,
    store,
    runner,
    errors,
    state: () => state,
    completions: () => completions,
  };
}
it('状态转换遇到并发提交后重读最新检查点，重复取消不再写入', async () => {
  const test = setup();
  const commit = test.store.commit;
  const commits = jest.spyOn(test.store, 'commit');
  commits.mockImplementationOnce(async (job) => {
    const concurrent = parseWorkflow(job.workflow);
    currentStep(concurrent).checkpoint.submission = {
      hash: 'concurrent',
      phase: 'prepared',
    };
    await commit(job, concurrent);
    return false;
  });
  await test.runner.transition(1, (workflow) =>
    requestCancellation(workflow, now),
  );
  expect(commits).toHaveBeenCalledTimes(2);
  expect(test.state().workflow.status).toBe('cancelling');
  expect(currentStep(test.state().workflow).checkpoint.submission?.hash).toBe(
    'concurrent',
  );
  await test.runner.transition(1, (workflow) =>
    requestCancellation(workflow, now),
  );
  expect(commits).toHaveBeenCalledTimes(2);
});
it.each([
  ['download'],
  ['refreshPlayer', 'submitDownload', 'download'],
] as AtomType[][])('按快照执行变长流程 %j', async (...types: AtomType[]) => {
  const test = setup(types);
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('succeeded');
  expect(test.completions()).toBe(1);
  expect(
    test.state().workflow.steps.every((step) => step.status === 'succeeded'),
  ).toBe(true);
  await test.runner.start(1);
  expect(test.completions()).toBe(1);
  expect(test.errors).not.toHaveBeenCalled();
});
it('取消先持久化，等待在途操作收敛，迟到成功不运行下一步', async () => {
  const test = setup();
  const entered = deferred<void>();
  const finish = deferred<{ qbtTorrentHash: string }>();
  jest.spyOn(test.atoms.submitDownload, 'run').mockImplementation(async () => {
    entered.resolve();
    return finish.promise;
  });
  const running = test.runner.start(1);
  await entered.promise;
  const job = await test.store.read(1);
  await test.store.commit(job, requestCancellation(job.workflow, now));
  finish.resolve({ qbtTorrentHash: 'hash' });
  await running;
  expect(test.atoms.download.run).not.toHaveBeenCalled();
  expect(test.atoms.submitDownload.cancel).toHaveBeenCalledTimes(1);
  expect(test.state().workflow.status).toBe('cancelled');
  expect(test.completions()).toBe(0);
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('cancelled');
});
it('取消失败后重试仅执行取消，已完成的取消钩子不重复执行', async () => {
  const test = setup();
  const job = await test.store.read(1);
  job.workflow.currentStepId = 'download';
  job.workflow.steps[0].status = 'succeeded';
  job.workflow.steps[0].attempt = 1;
  job.workflow.steps[1].status = 'running';
  job.workflow.steps[1].attempt = 1;
  await test.store.commit(job, requestCancellation(job.workflow, now));
  jest
    .spyOn(test.atoms.submitDownload, 'cancel')
    .mockRejectedValueOnce(new Error('下载器断连'));
  await test.runner.start(1);
  expect(test.state().workflow.error?.operation).toBe('cancel');
  expect(test.state().workflow.status).toBe('failed');
  const failed = await test.store.read(1);
  await test.store.commit(failed, retryWorkflow(failed.workflow, now));
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('cancelled');
  expect(test.atoms.download.cancel).toHaveBeenCalledTimes(1);
  expect(test.atoms.download.run).not.toHaveBeenCalled();
});
it('重试和恢复复用成功产物，只执行当前未结束步骤', async () => {
  const test = setup();
  jest
    .spyOn(test.atoms.submitDownload, 'run')
    .mockResolvedValue({ qbtTorrentHash: 'hash' });
  jest
    .spyOn(test.atoms.download, 'run')
    .mockRejectedValueOnce(new Error('断连'))
    .mockResolvedValue({ downloadPath: '/download' });
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('failed');
  const failed = await test.store.read(1);
  await test.store.commit(failed, retryWorkflow(failed.workflow, now));
  const recovered = new WorkflowRunner(test.store, test.atoms, test.errors);
  await recovered.start(1);
  expect(test.atoms.submitDownload.run).toHaveBeenCalledTimes(1);
  expect(test.state().input.steps.submitDownload).toEqual({
    qbtTorrentHash: 'hash',
  });
  expect(test.completions()).toBe(1);
});
it('取消中的任务重启继续取消，取消前的检查点仍可读取', async () => {
  const test = setup(['submitDownload']);
  const job = await test.store.read(1);
  currentStep(job.workflow).attempt = 1;
  currentStep(job.workflow).checkpoint.submission = {
    hash: 'known',
    phase: 'requested',
  };
  await test.store.commit(job, requestCancellation(job.workflow, now));
  jest
    .spyOn(test.atoms.submitDownload, 'cancel')
    .mockImplementation(async (_id, _input, context: AtomContext) => {
      expect(context.checkpoint.submission?.hash).toBe('known');
    });
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('cancelled');
  expect(test.atoms.submitDownload.run).not.toHaveBeenCalled();
});

it('旧尝试的迟到检查点不能覆盖重试后的状态，重复启动不重复执行', async () => {
  const test = setup(['submitDownload']);
  let stale: AtomContext;
  const entered = deferred<void>();
  const finish = deferred<{ qbtTorrentHash: string }>();
  jest
    .spyOn(test.atoms.submitDownload, 'run')
    .mockImplementationOnce(async (_id, _input, context) => {
      stale = context;
      throw new Error('失败');
    })
    .mockImplementationOnce(async () => {
      entered.resolve();
      return finish.promise;
    });
  await test.runner.start(1);
  const failed = await test.store.read(1);
  await test.store.commit(failed, retryWorkflow(failed.workflow, now));
  const running = test.runner.start(1);
  await entered.promise;
  expect(test.runner.start(1)).toBe(running);
  await expect(
    stale!.saveCheckpoint({
      submission: { hash: 'stale', phase: 'confirmed' },
    }),
  ).rejects.toBeInstanceOf(ExecutionStopped);
  finish.resolve({ qbtTorrentHash: 'current' });
  await running;
  expect(test.state().input.steps.submitDownload).toEqual({
    qbtTorrentHash: 'current',
  });
  expect(test.atoms.submitDownload.run).toHaveBeenCalledTimes(2);
  expect(test.completions()).toBe(1);
});

it('启动时仍在执行的步骤调用恢复钩子，不重新调用执行钩子', async () => {
  const test = setup(['download']);
  const job = await test.store.read(1);
  currentStep(job.workflow).status = 'running';
  currentStep(job.workflow).attempt = 1;
  await test.store.commit(job, job.workflow);
  await test.runner.start(1);
  expect(test.atoms.download.recover).toHaveBeenCalledTimes(1);
  expect(test.atoms.download.run).not.toHaveBeenCalled();
  expect(test.state().workflow.status).toBe('succeeded');
});

it('中止队列等待后继续取消，不等待外部批次返回，也不接收迟到结果', async () => {
  const test = setup(['download']);
  const entered = deferred<void>();
  const batch = deferred<{ downloadPath: string }>();
  jest
    .spyOn(test.atoms.download, 'run')
    .mockImplementation(async (_id, _input, context) => {
      entered.resolve();
      return context.waitFor(batch.promise);
    });
  const running = test.runner.start(1);
  await entered.promise;
  const current = test.state();
  await test.store.commit(current, requestCancellation(current.workflow, now));
  void test.runner.start(1);
  await running;
  expect(test.state().workflow.status).toBe('cancelled');
  batch.resolve({ downloadPath: '/late' });
  await Promise.resolve();
  expect(test.state().input.steps.download).toBeUndefined();
});
it('执行器不根据 atom 名称添加发布互斥', async () => {
  const test = setup(['importFile']);
  await test.runner.start(1);
  expect(test.state().workflow.status).toBe('succeeded');
  expect(test.state().workflow.publicationClaimed).toBeUndefined();
});
