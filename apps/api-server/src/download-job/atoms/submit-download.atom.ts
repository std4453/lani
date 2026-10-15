import { AsyncAtom, AtomContext, StepInput } from '@/task/atom';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubmitDownloadAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'submitDownload'
> {
  readonly wants = [] as const;
  constructor(private client: IDownloadClient) {
    super();
  }

  async run(
    _id: number,
    { params: { torrentLink } }: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    if (!torrentLink) throw new Error('缺少种子地址');
    const torrent = await this.client.prepareTorrent(torrentLink);
    const { hash, name } = torrent;
    const previous = context.checkpoint.submission;
    if (previous && previous.hash !== hash)
      throw new Error('种子地址对应的 hash 已变化，请新建任务');
    await context.assertActive();
    if (!previous)
      await context.saveCheckpoint({
        submission: { hash, ...(name ? { name } : {}), phase: 'prepared' },
      });
    await context.assertActive();
    await context.saveCheckpoint({
      submission: { hash, ...(name ? { name } : {}), phase: 'requested' },
    });
    await context.assertActive();
    // 请求与确认收敛后才进入取消清理，避免迟到添加覆盖已经完成的清理。
    await this.client.submitTorrent(torrent);
    await context.saveCheckpoint({
      submission: { hash, ...(name ? { name } : {}), phase: 'confirmed' },
    });
    return { qbtTorrentHash: hash, torrentTitle: name };
  }

  async cancel(
    _id: number,
    _input: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    const submission = context.checkpoint.submission;
    if (!submission || submission.phase === 'prepared') return;
    if (submission.phase === 'requested') {
      // 添加接口异步入队，单次查询不存在不能证明提交没有发生。
      let visible = false;
      for (let attempt = 0; attempt < 30; ++attempt) {
        if ((await this.client.lookupTorrents([submission.hash])).length) {
          visible = true;
          break;
        }
        await context.wait(1000);
      }
      if (!visible)
        throw new Error('种子提交结果尚未确认，无法确认取消完成，请重试');
      await context.saveCheckpoint({
        submission: { ...submission, phase: 'confirmed' },
      });
    }
    await this.client.removeTorrent(submission.hash);
  }
}
