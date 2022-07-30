import { CommonModule } from '@/common/index.module';
import { SkyhookResolver } from '@/season-scrape/skyhook/index.resolver';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [SkyhookSeasonService, SkyhookResolver],
  exports: [SkyhookSeasonService],
})
export class SkyhookModule {}
