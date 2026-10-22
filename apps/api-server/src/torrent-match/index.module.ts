import { BackgroundQueueModule } from '@/background-queue/index.module';
import { CommonModule } from '@/common/index.module';
import { Module } from '@nestjs/common';
import { TorrentMatchService } from './index.service';
import { MatchCatalogConsumer, TorrentMatchConsumer } from './consumers';
import { TorrentMatchResolver } from './index.resolver';

@Module({
  imports: [CommonModule, BackgroundQueueModule],
  providers: [
    TorrentMatchService,
    TorrentMatchResolver,
    MatchCatalogConsumer,
    TorrentMatchConsumer,
  ],
})
export class TorrentMatchModule {}
