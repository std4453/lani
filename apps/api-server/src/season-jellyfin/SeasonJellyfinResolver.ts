import { PrismaService } from '@/common/prisma.service';
import { SeasonJellyfinService } from '@/season-jellyfin/SeasonJellyfinService';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class SeasonJellyfinResolver {
  constructor(
    private seasonJellyfin: SeasonJellyfinService,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => Boolean)
  async syncJellyfinSeriesId(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        jellyfinFolder: true,
      },
    });
    return this.seasonJellyfin.syncJellyfinSeriesId(season);
  }
}
