import { Args, Query, Resolver } from '@nestjs/graphql';
import { MikanRSSItem } from 'src/fetch-mikan/index.model';
import { FetchMikanService } from 'src/fetch-mikan/index.service';

@Resolver()
export class FetchMikanResolver {
  constructor(private fetchMikanService: FetchMikanService) {}

  @Query((returns) => [MikanRSSItem])
  async fetchMikan(@Args('partialURL') partialURL: string) {
    return this.fetchMikanService.fetchMikanRSSItems(partialURL);
  }
}
