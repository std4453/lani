import { CommonModule } from '@/common/index.module';
import { SkyhookResolver } from '@/sync/skyhook/index.resolver';
import { SkyhookSeasonService } from '@/sync/skyhook/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [SkyhookSeasonService, SkyhookResolver],
  exports: [SkyhookSeasonService],
})
export class SkyhookModule {}
