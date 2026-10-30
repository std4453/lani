import { AsyncAtom, AtomContext, TaskInput } from '@/task/atom';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class SubmitDownloadAtom extends AsyncAtom {
  readonly wants = [] as const;
  constructor(private client: IDownloadClient, private prisma: PrismaService) {
    super();
  }

  async run(
    _id: number,
    { torrentLink, type, qbtTorrentHash }: TaskInput,
    context: AtomContext,
  ) {
    if (!torrentLink) throw new Error('缺少种子地址');
    const torrent = await this.client.prepareTorrent(torrentLink);
    const { hash, clientHash, name } = torrent;
    const previous = context.checkpoint.submission;
    // 首次比较两次 prepareTorrent 派生的 ID（v2 截断、hybrid 优先 v2）。
    // 重试时 qbtTorrentHash 可能已是下载器实际 ID，改用 checkpoint 的内容 hash 校验。
    if (type === 'BATCH_DOWNLOAD' && !previous && qbtTorrentHash !== clientHash)
      throw new Error('种子内容与预览不一致，请重新选择种子');
    if (previous && previous.hash !== hash)
      throw new Error('种子地址对应的 hash 已变化，请新建任务');
    await context.assertActive();
    await context.saveCheckpoint(
      {
        submission: {
          hash,
          clientHash,
          ...(name ? { name } : {}),
          phase: 'requested',
        },
      },
      { qbtTorrentHash: clientHash, torrentTitle: name },
    );
    await context.assertActive();
    // 请求与确认收敛后才进入取消清理，避免迟到添加覆盖已经完成的清理。
    const confirmed =
      type === 'BATCH_DOWNLOAD'
        ? await this.client.submitTorrent(torrent, { preservePaths: true })
        : await this.client.submitTorrent(torrent);
    const output = { qbtTorrentHash: confirmed.hash, torrentTitle: name };
    await context.saveCheckpoint(
      {
        submission: {
          hash,
          clientHash: confirmed.hash,
          ...(name ? { name } : {}),
          phase: 'confirmed',
        },
      },
      output,
    );
    return output;
  }

  async cancel(id: number, _input: TaskInput, context: AtomContext) {
    const submission = context.checkpoint.submission;
    if (!submission) return;
    const clientHash = submission.clientHash ?? submission.hash;
    if (submission.phase === 'requested') {
      // 添加接口异步入队，单次查询不存在不能证明提交没有发生。
      let visible = false;
      for (let attempt = 0; attempt < 30; ++attempt) {
        if ((await this.client.lookupTorrents([clientHash])).length) {
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
    // 取消仅释放本任务；其他未完成下载仍依赖同一个下载器种子。
    const shared = await this.prisma.task.findFirst({
      where: {
        id: { not: id },
        type: { in: ['DOWNLOAD', 'BATCH_DOWNLOAD'] },
        qbtTorrentHash: { equals: clientHash, mode: 'insensitive' },
        legacyStage: { not: 'AVAILABLE' },
        isCancelled: false,
        isFailed: false,
      },
      select: { id: true },
    });
    if (!shared) await this.client.removeTorrent(clientHash);
  }
}
