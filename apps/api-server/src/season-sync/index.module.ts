import { CommonModule } from '@/common/index.module';
import { BangumiModule } from '@/season-sync/bangumi/index.module';
import { SyncMetadataResolver } from '@/season-sync/index.resolver';
import { SkyhookModule } from '@/season-sync/skyhook/index.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SkyhookModule, BangumiModule, CommonModule, ConfigModule],
  providers: [SyncMetadataResolver],
})
export class SeasonSyncModule {}
