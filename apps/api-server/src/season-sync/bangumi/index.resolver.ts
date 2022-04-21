import { BangumiSeasonService } from '@/season-sync/bangumi/index.service';
import {
  FetchPartialSeasonRequest,
  PartialSeason,
} from '@/season-sync/index.model';
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
