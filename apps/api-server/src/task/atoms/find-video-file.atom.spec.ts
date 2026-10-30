import { FindVideoFileAtom } from './find-video-file.atom';
import { AtomContext, TaskInput } from '../atom';

const input = {
  id: 1,
  sourcePath: null,
  episodeId: null,
  torrentLink: null,
  torrentTitle: null,
  importPath: null,
  filePath: null,
  nfoPath: null,
  downloadTimeoutMinutes: null,
  jellyfinEpisodeId: null,
  type: 'BATCH_DOWNLOAD',
  qbtTorrentHash: 'hash',
  downloadPath: '/downloads',
  batchEntries: [
    { id: 'a', episodeId: 1, sourcePath: '合集/01.mkv' },
    { id: 'b', episodeId: 2, sourcePath: '合集/02.mkv' },
  ],
} as TaskInput;

function setup(paths = ['合集/01.mkv', '合集/02.mkv']) {
  const client = {
    getTorrentFiles: jest.fn(async () =>
      paths.map((path) => ({ path, size: 10 })),
    ),
  };
  const atom = new FindVideoFileAtom(client as never);
  const state = {
    input: JSON.parse(JSON.stringify(input)) as TaskInput,
    checkpoint: {},
  };
  const context = {
    get checkpoint() {
      return state.checkpoint;
    },
    assertActive: jest.fn(),
    updateCheckpoint: async (update) => {
      const change = update(state);
      state.checkpoint = change.checkpoint;
      state.input = { ...state.input, ...change.output };
    },
  } as unknown as AtomContext;
  return { atom, state, context, client };
}
it('整季任务按用户映射找到每个文件，不使用单集的 90% 大小推断', async () => {
  const { atom, state, context } = setup();
  await atom.run(1, state.input, context);
  expect(state.input.batchEntries).toEqual([
    {
      id: 'a',
      episodeId: 1,
      sourcePath: '合集/01.mkv',
      importPath: '/downloads/合集/01.mkv',
    },
    {
      id: 'b',
      episodeId: 2,
      sourcePath: '合集/02.mkv',
      importPath: '/downloads/合集/02.mkv',
    },
  ]);
});
it('缺失文件报告具体剧集，已找到的文件保留检查点', async () => {
  const { atom, state, context } = setup(['合集/01.mkv']);
  await expect(atom.run(1, state.input, context)).rejects.toThrow(
    '剧集 #2（合集/02.mkv）：下载结果中未找到所选文件',
  );
  expect(state.checkpoint).toEqual({
    entries: { a: { completed: true } },
  });
});
it('历史或篡改的相对路径不能逃逸下载目录', async () => {
  const { atom, state, context } = setup(['../outside.mkv']);
  state.input.batchEntries = [
    { id: 'a', episodeId: 1, sourcePath: '../outside.mkv' },
  ];
  await expect(atom.run(1, state.input, context)).rejects.toThrow('未找到');
});
