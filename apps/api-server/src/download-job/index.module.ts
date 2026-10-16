import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { TaskModule } from '@/task/index.module';
import { DownloadJobService } from './index.service';
@Module({
  imports: [CommonModule, TaskModule],
  providers: [DownloadJobService],
  exports: [DownloadJobService],
})
export class DownloadJobModule {}
