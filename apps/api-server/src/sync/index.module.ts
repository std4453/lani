import { BangumiModule } from '@/sync/bangumi/index.module';
import { SkyhookModule } from '@/sync/skyhook/index.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SkyhookModule, BangumiModule],
})
export class SyncModule {}
