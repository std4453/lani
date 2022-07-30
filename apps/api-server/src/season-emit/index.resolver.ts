import { PrismaService } from '@/common/prisma.service';
import { SeasonEmitService } from '@/season-emit/index.service';
import { ConflictException } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class SeasonEmitResolver {
  constructor(
    private seasonEmit: SeasonEmitService,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => ID)
  async writeMetadata(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        jellyfinFolder: true,
        bannerImage: true,
        fanartImage: true,
        posterImage: true,
      },
    });
    await this.seasonEmit.writeSeasonMetadata(season);
    return 'ok';
  }
}
