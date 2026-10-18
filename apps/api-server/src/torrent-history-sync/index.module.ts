import { MikanSyncModule } from '@/mikan-sync/index.module';
import { NyaaSyncModule } from '@/nyaa-sync/index.module';
import { Module } from '@nestjs/common';
import { TorrentHistorySyncResolver } from './index.resolver';
import { TorrentHistorySyncService } from './index.service';

@Module({
  imports: [MikanSyncModule, NyaaSyncModule],
  providers: [TorrentHistorySyncService, TorrentHistorySyncResolver],
})
export class TorrentHistorySyncModule {}
