import { BangumiSeasonService } from '@/sync/bangumi/index.service';
import { FetchPartialSeasonRequest, PartialSeason } from '@/sync/index.model';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class BangumiResolver {
  constructor(private bangumiSeasonService: BangumiSeasonService) {}

  @Query(() => PartialSeason)
  async fetchBangumiSeason(
    @Args('request') request: FetchPartialSeasonRequest,
    @Args('bangumiId') bangumiId: number,
  ) {
    return this.bangumiSeasonService.fetch(request, `${bangumiId}`);
  }
}
