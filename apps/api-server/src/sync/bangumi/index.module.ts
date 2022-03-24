import { CommonModule } from '@/common/index.module';
import { BangumiResolver } from '@/sync/bangumi/index.resolver';
import { BangumiSeasonService } from '@/sync/bangumi/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [BangumiSeasonService, BangumiResolver],
  exports: [BangumiSeasonService],
})
export class BangumiModule {}
