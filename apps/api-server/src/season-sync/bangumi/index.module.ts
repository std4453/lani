import { CommonModule } from '@/common/index.module';
import { BangumiResolver } from '@/season-sync/bangumi/index.resolver';
import { BangumiSeasonService } from '@/season-sync/bangumi/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [BangumiSeasonService, BangumiResolver],
  exports: [BangumiSeasonService],
})
export class BangumiModule {}
