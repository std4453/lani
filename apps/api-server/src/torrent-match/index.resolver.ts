import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { TorrentMatchService } from './index.service';

@Resolver()
export class TorrentMatchResolver {
  constructor(private readonly matching: TorrentMatchService) {}

  @Mutation(() => Boolean)
  cancelTorrentSeasonMatch(@Args('torrentId', { type: () => Int }) id: number) {
    return this.matching.cancelAssociation(id);
  }
}
