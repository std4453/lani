import { CommonModule } from '@/common/index.module';
import { TorrentSyncModule } from '@/torrent-sync/index.module';
import { Module } from '@nestjs/common';
import { NyaaSyncService } from './index.service';
import { NyaaSyncResolver } from './index.resolver';

@Module({
  imports: [CommonModule, TorrentSyncModule],
  providers: [NyaaSyncService, NyaaSyncResolver],
})
export class NyaaSyncModule {}
