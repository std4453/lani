import { CommonModule } from '@/common/index.module';
import { TorrentSyncModule } from '@/torrent-sync/index.module';
import { Module } from '@nestjs/common';
import { NyaaSyncService } from './index.service';
import { NyaaSyncResolver } from './index.resolver';
import { NyaaMetadataService } from './metadata.service';

@Module({
  imports: [CommonModule, TorrentSyncModule],
  providers: [NyaaSyncService, NyaaSyncResolver, NyaaMetadataService],
  exports: [NyaaSyncService],
})
export class NyaaSyncModule {}
