import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TorrentHistorySyncState } from './index.model';
import { TorrentHistorySyncService } from './index.service';

@Resolver()
export class TorrentHistorySyncResolver {
  constructor(private service: TorrentHistorySyncService) {}

  @Mutation(() => String)
  syncTorrentHistory() {
    return this.service.start();
  }

  @Query(() => TorrentHistorySyncState)
  torrentHistorySyncState(@Args('id') id: string) {
    return this.service.status(id);
  }
}
