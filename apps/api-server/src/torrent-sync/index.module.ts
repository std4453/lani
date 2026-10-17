import { CommonModule } from '@/common/index.module';
import { ParseTorrentModule } from '@/parse-torrent/index.module';
import { Module } from '@nestjs/common';
import { TorrentSyncService } from './index.service';

@Module({
  imports: [CommonModule, ParseTorrentModule],
  providers: [TorrentSyncService],
  exports: [TorrentSyncService],
})
export class TorrentSyncModule {}
