import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { MediaPoolModule } from '@/media-pool/index.module';
import { SeasonEmitModule } from '@/season-emit/index.module';
import { MediaStartupService } from './startup.service';
import { MediaBackfillService } from './backfill.service';
@Module({
  imports: [CommonModule, MediaPoolModule, SeasonEmitModule],
  providers: [MediaStartupService, MediaBackfillService],
})
export class MediaInitializationModule {}
