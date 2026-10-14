import { AsyncAtom, AtomContext, StepInput } from '@/download-job/atoms';
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
    const { hash, name } = await this.client.submitTorrentLink(torrentLink, {
      assertActive: () => context.assertActive(),
      prepared: async (info) => {
        const previous = context.checkpoint.submission;
        if (previous && previous.hash !== info.hash)
          throw new Error('种子地址对应的 hash 已变化，请新建任务');
        if (!previous)
          await context.saveCheckpoint({
            submission: {
              hash: info.hash,
              ...(info.name ? { name: info.name } : {}),
              phase: 'prepared',
            },
          });
      },
      requested: async () => {
        await context.saveCheckpoint({
          submission: { ...context.checkpoint.submission!, phase: 'requested' },
        });
      },
      confirmed: async () => {
        await context.saveCheckpoint({
          submission: { ...context.checkpoint.submission!, phase: 'confirmed' },
        });
      },
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
