import { SubmitDownloadAtom } from './submit-download.atom';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { AtomContext } from '@/task/atom';
import { Checkpoint } from '@lani/workflow';
function setup(checkpoint: Checkpoint = {}) {
  const client = {
    prepareTorrent: jest.fn(async () => ({
      hash: 'known',
      clientHash: 'prepared-id',
      name: 'video',
      input: 'magnet:test',
    })),
    submitTorrent: jest.fn(async () => ({ hash: 'client-id' })),
    lookupTorrents: jest.fn(),
    removeTorrent: jest.fn(async () => undefined),
  };
  const context: AtomContext = {
    stepId: 'test',
    attempt: 1,
    waitFor: async (operation) => operation,
    checkpoint,
    assertActive: jest.fn(async () => undefined),
    wait: jest.fn(async () => undefined),
    transaction: jest.fn(),
    updateCheckpoint: jest.fn(),
    saveCheckpoint: jest.fn(async (value) => {
      Object.assign(checkpoint, value);
    }),
  };
  const atom = new SubmitDownloadAtom(client as unknown as IDownloadClient);
  const input = {
    type: 'DOWNLOAD' as const,
    sourcePath: null,
    batchEntries: null,
    id: 1,
    episodeId: 1,
    torrentLink: 'magnet:test',
    qbtTorrentHash: null,
    torrentTitle: null,
    downloadPath: null,
    importPath: null,
    filePath: null,
    nfoPath: null,
    jellyfinEpisodeId: null,
  };
  return { client, context, atom, input };
}
it('整季下载拒绝预览后被替换的种子，且不保存或提交下载', async () => {
  const test = setup();
  await expect(
    test.atom.run(
      1,
      { ...test.input, type: 'BATCH_DOWNLOAD', qbtTorrentHash: 'preview-id' },
      test.context,
    ),
  ).rejects.toThrow('与预览不一致');
  expect(test.client.submitTorrent).not.toHaveBeenCalled();
  expect(test.context.saveCheckpoint).not.toHaveBeenCalled();
});
it('整季下载验证预览身份后沿用下载器确认的实际 ID', async () => {
  const test = setup();
  await expect(
    test.atom.run(
      1,
      { ...test.input, type: 'BATCH_DOWNLOAD', qbtTorrentHash: 'prepared-id' },
      test.context,
    ),
  ).resolves.toEqual({ qbtTorrentHash: 'client-id', torrentTitle: 'video' });
  expect(test.client.submitTorrent).toHaveBeenCalledWith(expect.any(Object), {
    preservePaths: true,
  });
});
it('先保存 hash 和提交意图，再确认完成', async () => {
  const test = setup();
  test.client.submitTorrent.mockImplementation(async () => {
    expect(test.context.checkpoint.submission).toEqual({
      hash: 'known',
      clientHash: 'prepared-id',
      name: 'video',
      phase: 'requested',
    });
    return { hash: 'client-id' };
  });
  await expect(test.atom.run(1, test.input, test.context)).resolves.toEqual({
    qbtTorrentHash: 'client-id',
    torrentTitle: 'video',
  });
  expect(test.context.checkpoint.submission?.phase).toBe('confirmed');
  expect(test.context.checkpoint.submission?.hash).toBe('known');
  expect(test.context.checkpoint.submission?.clientHash).toBe('client-id');
  expect(test.context.saveCheckpoint).toHaveBeenCalledTimes(2);
  expect(test.context.saveCheckpoint).toHaveBeenNthCalledWith(
    1,
    {
      submission: {
        hash: 'known',
        clientHash: 'prepared-id',
        name: 'video',
        phase: 'requested',
      },
    },
    { qbtTorrentHash: 'prepared-id', torrentTitle: 'video' },
  );
});
it('确认后保存实际 ID，重启重试仍按原内容身份校验', async () => {
  const test = setup({
    submission: {
      hash: 'known',
      clientHash: 'old-client-id',
      phase: 'confirmed',
    },
  });
  await test.atom.run(1, test.input, test.context);
  expect(test.context.saveCheckpoint).toHaveBeenLastCalledWith(
    {
      submission: {
        hash: 'known',
        clientHash: 'client-id',
        name: 'video',
        phase: 'confirmed',
      },
    },
    { qbtTorrentHash: 'client-id', torrentTitle: 'video' },
  );
  await test.atom.cancel(1, test.input, test.context);
  expect(test.client.removeTorrent).toHaveBeenCalledWith('client-id');
});
it('兼容仅保存旧 hash 的已确认 checkpoint', async () => {
  const test = setup({ submission: { hash: 'known', phase: 'confirmed' } });
  await test.atom.cancel(1, test.input, test.context);
  expect(test.client.removeTorrent).toHaveBeenCalledWith('known');
});
it('内容身份变化时不提交或覆盖已有 checkpoint', async () => {
  const test = setup({ submission: { hash: 'different', phase: 'requested' } });
  await expect(test.atom.run(1, test.input, test.context)).rejects.toThrow(
    'hash 已变化',
  );
  expect(test.client.submitTorrent).not.toHaveBeenCalled();
  expect(test.context.saveCheckpoint).not.toHaveBeenCalled();
});
it('未确认提交不可因首次查询缺失而报告取消成功', async () => {
  const test = setup({ submission: { hash: 'known', phase: 'requested' } });
  test.client.lookupTorrents.mockResolvedValue([]);
  await expect(test.atom.cancel(1, test.input, test.context)).rejects.toThrow(
    '尚未确认',
  );
  expect(test.client.removeTorrent).not.toHaveBeenCalled();
});
it('异步入队后按 hash 移除，断连恢复后可以重试取消', async () => {
  const test = setup({ submission: { hash: 'known', phase: 'requested' } });
  test.client.lookupTorrents
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ hash: 'known' }]);
  await expect(test.atom.cancel(1, test.input, test.context)).rejects.toThrow(
    'offline',
  );
  await test.atom.cancel(1, test.input, test.context);
  expect(test.client.removeTorrent).toHaveBeenCalledWith('known');
  expect(test.context.checkpoint.submission?.phase).toBe('confirmed');
});
it('尚未向下载器提交时无需清理', async () => {
  const test = setup();
  await test.atom.cancel(1, test.input, test.context);
  expect(test.client.lookupTorrents).not.toHaveBeenCalled();
  expect(test.client.removeTorrent).not.toHaveBeenCalled();
});

it('纯 v2 提交结果未确认时，取消按已保存的截断 ID 查询', async () => {
  const hash = 'a'.repeat(64);
  const clientHash = hash.slice(0, 40);
  const test = setup();
  test.client.prepareTorrent.mockResolvedValue({
    hash,
    clientHash,
    name: 'video',
    input: 'magnet:test',
  });
  test.client.submitTorrent.mockRejectedValue(new Error('timeout'));
  await expect(test.atom.run(1, test.input, test.context)).rejects.toThrow(
    'timeout',
  );
  expect(test.context.checkpoint.submission).toEqual({
    hash,
    clientHash,
    name: 'video',
    phase: 'requested',
  });
  expect(test.context.saveCheckpoint).toHaveBeenCalledWith(
    { submission: { hash, clientHash, name: 'video', phase: 'requested' } },
    { qbtTorrentHash: clientHash, torrentTitle: 'video' },
  );
  test.client.lookupTorrents.mockResolvedValue([{ hash: clientHash }]);
  await test.atom.cancel(1, test.input, test.context);
  expect(test.client.lookupTorrents).toHaveBeenCalledWith([clientHash]);
  expect(test.client.removeTorrent).toHaveBeenCalledWith(clientHash);
});
