import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { TaskModule } from '@/task/index.module';
import { DownloadJobService } from './index.service';
import { BatchDownloadService } from './batch-download.service';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
import { SmartDownloadService } from './smart-download.service';
import { SmartDownloadResolver } from './smart-download.resolver';
@Module({
  imports: [CommonModule, TaskModule, DownloadClientModule],
  providers: [
    DownloadJobService,
    BatchDownloadService,
    SmartDownloadService,
    SmartDownloadResolver,
  ],
  exports: [DownloadJobService],
})
export class DownloadJobModule {}
