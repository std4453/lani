import {
  FetchPartialSeasonRequest,
  PartialSeason,
} from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class SkyhookResolver {
  constructor(private skyhookSeasonService: SkyhookSeasonService) {}

  @Query(() => PartialSeason)
  async fetchSkyhookSeason(
    @Args('request') request: FetchPartialSeasonRequest,
    @Args('tvdbId') tvdbId: number,
    @Args('seasonId') seasonId: number,
  ) {
    return this.skyhookSeasonService.fetch(request, `${tvdbId}`, seasonId);
  }
}
