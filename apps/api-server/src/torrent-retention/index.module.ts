import { BackgroundQueueModule } from '@/background-queue/index.module';
import { CommonModule } from '@/common/index.module';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
import { TaskModule } from '@/task/index.module';
import { Module } from '@nestjs/common';
import { TorrentRetentionService } from './index.service';

@Module({
  imports: [
    CommonModule,
    DownloadClientModule,
    BackgroundQueueModule,
    TaskModule,
  ],
  providers: [TorrentRetentionService],
})
export class TorrentRetentionModule {}
