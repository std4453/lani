import { SkyhookResolver } from '@/sync/skyhook/index.resolver';
import { SkyhookSeasonService } from '@/sync/skyhook/index.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [SkyhookSeasonService, SkyhookResolver],
  exports: [SkyhookSeasonService],
})
export class SkyhookModule {}
