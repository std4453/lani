import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
import { MediaPoolModule } from '@/media-pool/index.module';
import { SeasonEmitModule } from '@/season-emit/index.module';
import { TaskModule } from '@/task/index.module';
import { MediaStartupService } from './startup.service';
import { MediaBackfillService } from './backfill.service';
@Module({
  imports: [
    CommonModule,
    DownloadClientModule,
    MediaPoolModule,
    SeasonEmitModule,
    TaskModule,
  ],
  providers: [MediaStartupService, MediaBackfillService],
})
export class MediaInitializationModule {}
