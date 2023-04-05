import { CollectionTypeOptions, LibraryStructureService } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ID, Mutation, Resolver } from '@nestjs/graphql';

@Injectable()
@Resolver()
export class JellyfinSyncService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  @Mutation(() => ID)
  async syncJellyfinFolders() {
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
    await this.prisma.$transaction([
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
    ]);
    return 'ok';
  }

  async onModuleInit() {
    await this.syncJellyfinFolders();
  }
}
