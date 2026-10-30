import { DownloadAtom } from './download-atom';
import { AtomContext, TaskInput } from '@/task/atom';
import { DownloadRefreshService } from './refresh/download-refresh.service';
import { IDownloadClient } from '@/download-client/IDownloadClient';

function wait(queue: DownloadRefreshService, timeoutMinutes?: number | null) {
  return new DownloadAtom(queue).run(
    1,
    {
      qbtTorrentHash: 'a',
      downloadTimeoutMinutes: timeoutMinutes,
    } as TaskInput,
    { waitFor: (promise) => promise } as AtomContext,
  );
}
test('使用下载器加入时间超时，通知执行器取消当前任务', async () => {
  const queue = new DownloadRefreshService({
    lookupTorrents: async () => [
      { hash: 'a', status: 'pending', addedAt: Date.now() / 1000 - 7201 },
    ],
  } as unknown as IDownloadClient);
  const result = expect(wait(queue, 120)).rejects.toMatchObject({
    code: 'timeout',
    message: '智能下载任务超时（120 分钟）',
  });
  await queue.refresh();
  await result;
});
test.each([null, 0, undefined])(
  '超时 %p 表示不限制，已完成任务优先成功',
  async (timeoutMinutes) => {
    const lookupTorrents = jest
      .fn()
      .mockResolvedValue([{ hash: 'a', status: 'pending', addedAt: 1 }]);
    const queue = new DownloadRefreshService({
      lookupTorrents,
    } as unknown as IDownloadClient);
    const result = wait(queue, timeoutMinutes);
    await queue.refresh();
    lookupTorrents.mockResolvedValue([
      { hash: 'a', status: 'success', downloadPath: '/test', addedAt: 1 },
    ]);
    await queue.refresh();
    expect(await result).toEqual({ downloadPath: '/test' });
  },
);
test('已经完成即使超过超时也不取消；查询失败和缺少时间不猜测超时', async () => {
  const lookupTorrents = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([{ hash: 'a', status: 'pending' }])
    .mockResolvedValue([
      { hash: 'a', status: 'success', addedAt: 1, downloadPath: '/test' },
    ]);
  const queue = new DownloadRefreshService({
    lookupTorrents,
  } as unknown as IDownloadClient);
  const result = wait(queue, 1);
  await queue.refresh();
  await queue.refresh();
  await queue.refresh();
  expect(await result).toEqual({ downloadPath: '/test' });
});
