import { CommonModule } from '@/common/index.module';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { MikanSyncResolver } from '@/mikan-sync/index.resolver';
import { MikanSyncService } from '@/mikan-sync/index.service';
import { ParseTorrentModule } from '@/parse-torrent/index.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [FetchMikanModule, CommonModule, ParseTorrentModule],
  providers: [MikanSyncService, MikanSyncResolver],
})
export class MikanSyncModule {}
