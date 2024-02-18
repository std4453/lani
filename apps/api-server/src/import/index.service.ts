import {
  JellyfinHelp,
  MetadataRefreshMode,
  TvShowsService,
} from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { DateFormat } from '@/constants/date-format';
import { LaniError } from '@/utils/error';
import { mapPath } from '@/utils/path';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';

// TODO: 复用代码

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  private async tryHardLink(
    sourcePath: string,
    targetPath: string,
  ): Promise<boolean> {
    // 源文件不存在，报错
    const { ino: sourceIno } = await fs.stat(sourcePath);
    try {
      const { ino: targetIno } = await fs.stat(targetPath);
      // 如果目标文件存在但ino不同，覆盖之
      if (sourceIno !== targetIno) {
        await fs.unlink(targetPath);
        try {
          await fs.link(sourcePath, targetPath);
        } catch (error) {
          if (error.code === 'EXDEV') {
            // mount point 不同，无法硬链接
            return false;
          } else {
            throw error;
          }
        }
      }
      // 如果ino相同，则内容一定相同，不需要操作
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果目标文件不存在，无视错误
        try {
          await fs.link(sourcePath, targetPath);
        } catch (error) {
          if (error.code === 'EXDEV') {
            // mount point 不同，无法硬链接
            return false;
          } else {
            throw error;
          }
        }
      } else {
        throw error;
      }
    }
    return true;
  }

  private async copy(sourcePath: string, targetPath: string) {
    // 自动覆盖目标文件
    await fs.copyFile(sourcePath, targetPath);
  }

  private async move(sourcePath: string, targetPath: string) {
    // 自动覆盖目标文件
    await fs.rename(sourcePath, targetPath);
  }

  private async importFile(episodeId: number, importPath: string) {
    const {
      index,
      season: { title: seasonTitle, jellyfinFolder },
    } = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: {
          include: {
            jellyfinFolder: true,
          },
        },
      },
    });
    const jellyfinFolderRoot = jellyfinFolder.location;
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);

    const sourcePath = mapPath(
      config.downloadClient[config.downloadClient.kind].pathMapping,
      importPath,
    );
    const targetPath = path.join(
      seasonRoot,
      seasonTitle,
      // 不加这个 jellyfin识别就会很成问题，还是加上
      'Season 1',
      `Episode - S01E${index.toString().padStart(2, '0')}${path.extname(
        importPath,
      )}`,
    );
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    switch (config.lani.moveStrategy) {
      case 'hardLinkOnly':
        if (!(await this.tryHardLink(sourcePath, targetPath))) {
          throw new Error('无法在不同文件系统之间建立硬链接');
        }
        break;
      case 'hardLinkOrCopy':
        if (await this.tryHardLink(sourcePath, targetPath)) {
          break;
        }
        await this.copy(sourcePath, targetPath);
        break;
      case 'hardLinkOrMove':
        if (await this.tryHardLink(sourcePath, targetPath)) {
          break;
        }
        await this.move(sourcePath, targetPath);
        break;
      case 'copyOnly':
        await this.copy(sourcePath, targetPath);
        break;
      case 'moveOnly':
        await this.move(sourcePath, targetPath);
        break;
    }

    return targetPath;
  }

  private readonly builder = new xml2js.Builder();
  private readonly parser = new xml2js.Parser();

  private async writeMetadata(episodeId: number, filePath: string) {
    const { index, title, airTime, description } =
      await this.prisma.episode.findUnique({
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
    // https://kodi.wiki/view/NFO_files/Episodes
    mergeXMLNode(
      {
        title: [title],
        ...(description ? { plot: [description] } : undefined),
        // 不设置 season 的话 Jellyfin 会显示未知
        season: [1],
        episode: [index],
        ...(airTime
          ? { aired: [dayjs(airTime).format(DateFormat.BarDay)] }
          : undefined),
        uniqueid: [
          {
            $: {
              type: 'lani',
              default: 'true',
            },
            _: episodeId,
          },
        ],
      },
      xmlObj.episodedetails,
    );
    const nfoContent = this.builder.buildObject(xmlObj);
    await fs.writeFile(nfoPath, nfoContent, 'utf-8');
    return nfoPath;
  }

  private async refreshEpisode(episodeId: number) {
    const {
      index,
      season: { jellyfinId: jellyfinSeriesId },
    } = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: true,
      },
    });
    if (!jellyfinSeriesId) {
      throw new Error('未获取到季度对应的Jellyfin ID，无法刷新');
    }
    const jellyfinEpisodeId = await this.getJellyfinEpisode(
      index,
      jellyfinSeriesId,
    );
    // 如果已经存在，则跳过刷新，直接获取
    if (jellyfinEpisodeId) {
      return jellyfinEpisodeId;
    }

    await JellyfinHelp.refreshItem({
      itemId: jellyfinSeriesId,
      metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
      imageRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    });

    return await this.waitJellyfin(jellyfinSeriesId, index);
  }

  private async getJellyfinEpisode(
    index: number,
    jellyfinSeriesId: string,
  ): Promise<string | undefined> {
    const { Items: episodes } = await TvShowsService.getEpisodes(
      jellyfinSeriesId,
      config.jellyfin.dummyUserId,
    );
    const jellyfinEpisodeId = (episodes ?? []).find(
      (episode) =>
        episode.IndexNumber === index && episode.ParentIndexNumber === 1,
    )?.Id;
    return jellyfinEpisodeId;
  }

  private async waitJellyfin(jellyfinSeriesId: string, index: number) {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const enqueueTime = new Date().getTime();

    while (true) {
      const jellyfinEpisodeId = await this.getJellyfinEpisode(
        index,
        jellyfinSeriesId,
      );

      if (jellyfinEpisodeId) {
        return jellyfinEpisodeId;
      }

      const now = new Date().getTime();
      // 5分钟内没有完成就算失败
      if (now - enqueueTime > 5 * 60 * 1000) {
        throw new LaniError('超过5分钟未被识别，请检查Jellyfin设置');
      }

      await sleep(1000);
    }
  }

  async importSingle(episodeId: number, importPath: string) {
    const filePath = await this.importFile(episodeId, importPath);
    await this.writeMetadata(episodeId, filePath);
    const jellyfinEpisodeId = await this.refreshEpisode(episodeId);
    await this.prisma.episode.update({
      where: {
        id: episodeId,
      },
      data: {
        jellyfinEpisodeId,
      },
    });
  }
}
