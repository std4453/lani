import { CommonModule } from '@/common/index.module';
import { SeasonEmitModule } from '@/season-emit/index.module';
import { BangumiModule } from '@/season-scrape/bangumi/index.module';
import { EpisodeScrapeService } from '@/season-scrape/EpisodeScrapeService';
import { ScrapeMetadataResolver } from '@/season-scrape/index.resolver';
import { SeasonScrapeService } from '@/season-scrape/SeasonScrapeService';
import { SkyhookModule } from '@/season-scrape/skyhook/index.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SkyhookModule,
    BangumiModule,
    CommonModule,
    ConfigModule,
    SeasonEmitModule,
  ],
  providers: [
    ScrapeMetadataResolver,
    EpisodeScrapeService,
    SeasonScrapeService,
  ],
})
export class SeasonScrapeModule {}
