import { MikanRSSItem } from '@/fetch-mikan/index.model';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class FetchMikanResolver {
  constructor(private fetchMikanService: FetchMikanService) {}

  @Query(() => [MikanRSSItem])
  async fetchMikan(@Args('partialURL') partialURL: string) {
    return this.fetchMikanService.fetchMikanRSSItems(partialURL);
  }
}
