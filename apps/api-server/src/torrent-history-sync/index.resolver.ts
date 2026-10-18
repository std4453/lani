import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TorrentHistorySync } from './index.model';
import { TorrentHistorySyncService } from './index.service';

@Resolver()
export class TorrentHistorySyncResolver {
  constructor(private service: TorrentHistorySyncService) {}

  @Mutation(() => String)
  syncTorrentHistory() {
    return this.service.start();
  }

  @Query(() => TorrentHistorySync)
  torrentHistorySync(@Args('id') id: string) {
    return this.service.status(id);
  }
}
