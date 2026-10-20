import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { TaskModule } from '@/task/index.module';
import { DownloadJobService } from './index.service';
import { BatchDownloadService } from './batch-download.service';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
@Module({
  imports: [CommonModule, TaskModule, DownloadClientModule],
  providers: [DownloadJobService, BatchDownloadService],
  exports: [DownloadJobService],
})
export class DownloadJobModule {}
