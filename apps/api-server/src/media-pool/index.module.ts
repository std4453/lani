import { MediaWriteStateModule } from './write-state.module';
import { MediaStartupService } from './startup.service';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { MediaPoolService } from './media-pool.service';

@Module({
  imports: [CommonModule, DownloadClientModule, MediaWriteStateModule],
  providers: [MediaPoolService, MediaStartupService],
  exports: [MediaPoolService, MediaStartupService],
})
export class MediaPoolModule {}
