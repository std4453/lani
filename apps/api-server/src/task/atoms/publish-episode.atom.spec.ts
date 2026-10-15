import { PrismaService } from '@/common/prisma.service';
import { AtomContext, ExecutionStopped, TaskInput } from '@/task/atom';
import { Workflow, parseWorkflow } from '@lani/workflow';
import { TaskStore } from '@/task/task-store';
import { WorkflowRunner } from '@/task/workflow-runner';
import { Atoms } from '@/task/atom';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PublishEpisodeAtom } from './publish-episode.atom';
import { claimEpisodePublication } from './publication';

jest.mock('./publication', () => ({
  claimEpisodePublication: jest.fn(),
  lockEpisode: jest.fn(),
}));
jest.mock('@/config', () => ({ __esModule: true, default: {} }));

function setup() {
  const workflow: Workflow = {
    schemaVersion: 1,
    definitionVersion: 1,
    status: 'running',
    currentStepId: 'publish',
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: 'publish',
        atom: 'publishEpisode',
        title: '发布剧集',
        status: 'running',
        attempt: 1,
        checkpoint: {},
      },
    ],
  };
  const input: TaskInput = {
    id: 1,
    episodeId: 2,
    torrentLink: null,
    qbtTorrentHash: null,
    torrentTitle: null,
    downloadPath: null,
    importPath: null,
    filePath: null,
    nfoPath: null,
    jellyfinEpisodeId: 'jellyfin-episode',
  };
  let association: string | null = null;
  const episode = {
    updateMany: jest.fn(async () => {
      if (association) return { count: 0 };
      association = input.jellyfinEpisodeId;
      return { count: 1 };
    }),
    findUnique: jest.fn(async () => ({
      id: 2,
      jellyfinEpisodeId: association,
    })),
  };
  let version = 0;
  const tx = {
    $queryRaw: jest.fn(async () => []),
    task: {
      findUnique: jest.fn(async () => ({
        ...input,
        version,
        workflow: parseWorkflow(workflow),
      })),
      updateMany: jest.fn(async ({ data }) => {
        Object.assign(workflow, data.workflow);
        ++version;
        return { count: 1 };
      }),
    },
    episode,
  };
  const prisma = {
    $transaction: async (run: (value: typeof tx) => Promise<boolean>) =>
      run(tx),
    episode,
    task: tx.task,
  };
  const store = new TaskStore(prisma as unknown as PrismaService);
  const context: AtomContext = new WorkflowRunner(
    store,
    {} as Atoms,
    jest.fn(),
  )['context'](
    { id: input.id, version, workflow: parseWorkflow(workflow), input },
    'publish',
  );
  const emitter = new EventEmitter2();
  const emit = jest.spyOn(emitter, 'emit');
  const atom = new PublishEpisodeAtom(
    prisma as unknown as PrismaService,
    emitter,
  );
  return {
    atom,
    input,
    context,
    workflow,
    episode,
    emit,
    tx,
    setAssociation: (value: string) => {
      association = value;
    },
  };
}

beforeEach(() => jest.clearAllMocks());

it('关联提交后尚未收尾时恢复，只通知首次发布', async () => {
  const test = setup();
  await test.atom.run(1, test.input, test.context);
  await test.atom.recover(1, test.input, test.context);
  expect(test.episode.updateMany).toHaveBeenCalledWith({
    where: { id: 2, jellyfinEpisodeId: null },
    data: { jellyfinEpisodeId: 'jellyfin-episode' },
  });
  expect(test.emit).toHaveBeenCalledTimes(1);
  expect(test.workflow.steps[0].checkpoint.episodePublished).toBe(true);
  expect(test.tx.task.updateMany).toHaveBeenCalledTimes(1);
  expect(claimEpisodePublication).toHaveBeenCalledWith(1, test.context, true);
});

it.each(['cancelled', 'stale-attempt', 'different-step'])(
  '事务内拒绝已失效执行：%s',
  async (reason) => {
    const test = setup();
    if (reason === 'cancelled') {
      test.workflow.status = 'cancelling';
      test.workflow.cancellation = {
        requestedAt: new Date().toISOString(),
        stepId: 'publish',
        completedAtoms: [],
      };
    } else if (reason === 'stale-attempt') test.workflow.steps[0].attempt = 2;
    else {
      test.workflow.steps[0].id = 'another';
      test.workflow.currentStepId = 'another';
    }
    await expect(
      test.atom.run(1, test.input, test.context),
    ).rejects.toBeInstanceOf(ExecutionStopped);
    expect(test.episode.updateMany).not.toHaveBeenCalled();
    expect(test.emit).not.toHaveBeenCalled();
  },
);

it('不覆盖其他 Jellyfin 关联', async () => {
  const test = setup();
  test.setAssociation('other-episode');
  await expect(test.atom.run(1, test.input, test.context)).rejects.toThrow(
    '已关联其他',
  );
  expect((await test.episode.findUnique()).jellyfinEpisodeId).toBe(
    'other-episode',
  );
  expect(test.emit).not.toHaveBeenCalled();
});

it('发布区段冲突时不进入关联事务', async () => {
  const test = setup();
  jest
    .mocked(claimEpisodePublication)
    .mockRejectedValueOnce(new Error('其他任务已发布'));
  await expect(test.atom.run(1, test.input, test.context)).rejects.toThrow(
    '其他任务已发布',
  );
  expect(test.tx.$queryRaw).not.toHaveBeenCalled();
  expect(test.emit).not.toHaveBeenCalled();
});
