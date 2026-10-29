import { BackgroundQueueModule } from '@/background-queue/index.module';
import { CommonModule } from '@/common/index.module';
import { LlmModule } from '@/llm/index.module';
import { Module } from '@nestjs/common';
import { TorrentMatchService } from './index.service';
import { MatchCatalogConsumer, TorrentMatchConsumer } from './consumers';
import { TorrentMatchResolver } from './index.resolver';
import { LlmMatcher } from './llm/llm-matcher';

@Module({
  imports: [CommonModule, BackgroundQueueModule, LlmModule],
  providers: [
    TorrentMatchService,
    LlmMatcher,
    TorrentMatchResolver,
    MatchCatalogConsumer,
    TorrentMatchConsumer,
  ],
})
export class TorrentMatchModule {}
