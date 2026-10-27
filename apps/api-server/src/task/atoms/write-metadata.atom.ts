import { BatchableEpisodeAtom } from '../batchable-episode-atom';
import { claimEpisodePublication } from './publication';
import { episodeNfo } from '@/utils/episode-nfo';
import { PrismaService } from '@/common/prisma.service';
import { TaskInput, AtomContext } from '@/task/atom';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';

@Injectable()
export class WriteMetadataAtom extends BatchableEpisodeAtom {
  readonly wants = [['importFile']] as const;

  constructor(private prisma: PrismaService) {
    super();
  }

  private readonly builder = new xml2js.Builder();
  private readonly parser = new xml2js.Parser();

  protected async runEpisode(
    id: number,
    { episodeId, filePath }: TaskInput,
    context: AtomContext,
  ) {
    await claimEpisodePublication(id, context, true);
    if (!filePath) {
      throw new Error('input step not finished');
    }
    if (!episodeId) {
      throw new Error('剧集已被删除');
    }
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });
    const nfoPath = filePath.replace(path.extname(filePath), '').concat('.nfo');
    // xml2js 对象结构没有类型，只能用 any
    let xmlObj: any = {};
    try {
      await fs.stat(nfoPath);
      const currentContent = await fs.readFile(nfoPath, 'utf8');
      xmlObj = await this.parser.parseStringPromise(currentContent);
    } catch (error) {
      // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
      // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
    }
    ensureXMLRoot(xmlObj, 'episodedetails');
    delete xmlObj.episodedetails.uniqueid;
    delete xmlObj.episodedetails.uniqueId;
    // https://kodi.wiki/view/NFO_files/Episodes
    mergeXMLNode(episodeNfo(episode), xmlObj.episodedetails);
    const nfoContent = this.builder.buildObject(xmlObj);
    await context.assertActive();
    const temporary = `${nfoPath}.lani-${id}-${context.entryId ?? 0}.tmp`;
    try {
      await fs.writeFile(temporary, nfoContent, 'utf-8');
      await context.assertActive();
      await fs.rename(temporary, nfoPath);
    } catch (error) {
      // 部分写入和取消也清理暂存文件；清理失败不能覆盖原始错误。
      await fs.rm(temporary, { force: true }).catch(() => undefined);
      throw error;
    }
    return {
      nfoPath,
    };
  }
}
