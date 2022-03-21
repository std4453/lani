import { BangumiResolver } from '@/sync/bangumi/index.resolver';
import { BangumiSeasonService } from '@/sync/bangumi/index.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [BangumiSeasonService, BangumiResolver],
  exports: [BangumiSeasonService],
})
export class BangumiModule {}
