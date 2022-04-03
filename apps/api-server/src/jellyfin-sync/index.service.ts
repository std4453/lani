import { CollectionTypeOptions, LibraryStructureService } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { mapPath, PathMapping } from '@/utils/path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ID, Mutation, Resolver } from '@nestjs/graphql';
import path from 'path';

@Injectable()
@Resolver()
export class JellyfinSyncService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {}

  private getMappedFolderLocation(location: string) {
    const mappedLocation = mapPath(
      this.config.get<PathMapping>('jellyfinPathMapping'),
      location,
    );
    const relative = path.relative(
      this.config.get('mediaRoot'),
      mappedLocation,
    );
    return relative;
  }

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
        location: this.getMappedFolderLocation(
          (folder.Locations ?? [])[0] ?? '',
        ),
        jellyfinId: folder.ItemId ?? '',
      }))
      .filter((folder) => !folder.location.startsWith('..'));
    await this.prisma.$transaction([
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
}
