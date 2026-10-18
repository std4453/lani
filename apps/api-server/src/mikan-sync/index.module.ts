import { CommonModule } from '@/common/index.module';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { MikanSyncResolver } from '@/mikan-sync/index.resolver';
import { MikanSyncService } from '@/mikan-sync/index.service';
import { TorrentSyncModule } from '@/torrent-sync/index.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [FetchMikanModule, CommonModule, TorrentSyncModule],
  providers: [MikanSyncService, MikanSyncResolver],
  exports: [MikanSyncService],
})
export class MikanSyncModule {}
