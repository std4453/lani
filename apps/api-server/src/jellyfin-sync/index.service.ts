import { CollectionTypeOptions, LibraryStructureService } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { JellyfinFolder } from '@lani/db';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ID, Mutation, Resolver } from '@nestjs/graphql';

@Injectable()
@Resolver()
export class JellyfinSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(JellyfinSyncService.name);

  constructor(private prisma: PrismaService) {}

  @Mutation(() => ID)
  async syncJellyfinFolders() {
    this.logger.log('Syncing jellyfin folders...');

    const folders = (await LibraryStructureService.getVirtualFolders())
      .filter(
        (folder) =>
          folder.Name &&
          folder.Locations?.length &&
          folder.ItemId &&
          // Jellyfin OpenAPI里面写的CollectionTypeOptions是CamelCase的，但实际上
          // 是全小写
          folder.CollectionType?.toLowerCase() ===
            CollectionTypeOptions.TV_SHOWS.toLowerCase(),
      )
      .map((folder) => ({
        name: folder.Name ?? '',
        location: (folder.Locations ?? [])[0] ?? '',
        jellyfinId: folder.ItemId ?? '',
      }))
      .filter((folder) => !folder.location.startsWith('..'));
    this.logger.verbose(`Got ${folders.length} folders of type TV_SHOWS`);

    const results = await this.prisma.$transaction([
      this.prisma.jellyfinFolder.findMany(),
      // 由于数据库侧设置 ON DELETE NO ACTION，如果这里试图删除用到的folder，会报错
      this.prisma.jellyfinFolder.deleteMany({
        where: {
          jellyfinId: {
            notIn: folders.map(({ jellyfinId }) => jellyfinId),
          },
        },
      }),
      ...folders.map(({ jellyfinId, location, name }) =>
        this.prisma.jellyfinFolder.updateMany({
          where: {
            jellyfinId,
          },
          data: {
            name,
            location,
          },
        }),
      ),
      this.prisma.jellyfinFolder.createMany({
        data: folders.map(({ jellyfinId, location, name }) => ({
          jellyfinId,
          location,
          name,
        })),
        skipDuplicates: true,
      }),
      this.prisma.jellyfinFolder.findMany(),
    ]);
    const beforeFolders = results[0] as JellyfinFolder[];
    const afterFolders = results[results.length - 1] as JellyfinFolder[];
    this.logger.log(
      `Synced jellyfin folders: ${beforeFolders.length} folder(s) -> ${afterFolders.length} folder(s)`,
    );

    return 'ok';
  }

  async onApplicationBootstrap() {
    await this.syncJellyfinFolders();
  }
}
