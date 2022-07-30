import { MetadataRefreshMode } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { SeasonWithJellyfinFolder } from '@/types/entities';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { JellyfinFolder, Season } from '@lani/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SeasonJellyfinService {
  constructor(private prisma: PrismaService) {}

  async refreshAfterUpdate({
    jellyfinId,
    jellyfinFolder,
  }: SeasonWithJellyfinFolder) {
    if (jellyfinId) {
      await JellyfinHelp.refreshItem({
        itemId: jellyfinId,
        metadataRefreshMode: MetadataRefreshMode.DEFAULT,
        imageRefreshMode: MetadataRefreshMode.DEFAULT,
      });
    } else {
      await JellyfinHelp.refreshItem({
        itemId: jellyfinFolder.jellyfinId,
        recursive: true,
      });
    }
  }

  async refreshAfterDelete({ jellyfinFolder }: SeasonWithJellyfinFolder) {
    await JellyfinHelp.refreshItem({
      itemId: jellyfinFolder.jellyfinId,
      metadataRefreshMode: MetadataRefreshMode.DEFAULT,
    });
  }

  async syncJellyfinSeriesId({
    id: seasonId,
    jellyfinId,
    title,
    jellyfinFolder,
  }: SeasonWithJellyfinFolder) {
    const items = await JellyfinHelp.getItemsByUserId({
      userId: config.jellyfin.dummyUserId,
      searchTerm: title,
      limit: 10,
      parentId: jellyfinFolder.jellyfinId,
      recursive: true,
      includeItemTypes: ['Series'],
    });
    const id = (items.Items ?? []).find((item) => item.Name === title)?.Id;
    if (!id) {
      return false;
    }
    if (id === jellyfinId) {
      return true;
    }
    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        jellyfinId: id,
      },
    });
    return true;
  }
}
