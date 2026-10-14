import { SubmitDownloadAtom } from './submit-download.atom';
import { IDownloadClient, SubmissionHooks } from '../client/IDownloadClient';
import { AtomContext } from './index';
import { Checkpoint } from '@lani/download-workflow';
function setup(checkpoint: Checkpoint = {}) {
  const client = {
    submitTorrentLink: jest.fn(),
    lookupTorrents: jest.fn(),
    removeTorrent: jest.fn(async () => undefined),
  };
  const context: AtomContext = {
    checkpoint,
    assertActive: jest.fn(async () => undefined),
    wait: jest.fn(async () => undefined),
    saveCheckpoint: async (value) => {
      Object.assign(checkpoint, value);
    },
  };
  const atom = new SubmitDownloadAtom(client as unknown as IDownloadClient);
  const input = {
    id: 1,
    params: { episodeId: 1, torrentLink: 'magnet:test' },
    steps: {},
  };
  return { client, context, atom, input };
}
it('先保存 hash 和提交意图，再确认完成', async () => {
  const test = setup();
  test.client.submitTorrentLink.mockImplementation(
    async (_link: string, hooks: SubmissionHooks) => {
      await hooks.prepared({ hash: 'known' });
      expect(test.context.checkpoint.submission).toEqual({
        hash: 'known',
        phase: 'prepared',
      });
      await hooks.requested();
      expect(test.context.checkpoint.submission?.phase).toBe('requested');
      await hooks.confirmed();
      return { hash: 'known', name: 'video' };
    },
  );
  await expect(test.atom.run(1, test.input, test.context)).resolves.toEqual({
    qbtTorrentHash: 'known',
    torrentTitle: 'video',
  });
  expect(test.context.checkpoint.submission?.phase).toBe('confirmed');
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
  const test = setup({ submission: { hash: 'known', phase: 'prepared' } });
  await test.atom.cancel(1, test.input, test.context);
  expect(test.client.lookupTorrents).not.toHaveBeenCalled();
  expect(test.client.removeTorrent).not.toHaveBeenCalled();
});
