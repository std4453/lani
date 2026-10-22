import { BackgroundQueueModule } from '@/background-queue/index.module';
import { CommonModule } from '@/common/index.module';
import { Module } from '@nestjs/common';
import { TorrentMatchService } from './index.service';
import { MatchCatalogConsumer, TorrentMatchConsumer } from './consumers';

@Module({
  imports: [CommonModule, BackgroundQueueModule],
  providers: [TorrentMatchService, MatchCatalogConsumer, TorrentMatchConsumer],
})
export class TorrentMatchModule {}
