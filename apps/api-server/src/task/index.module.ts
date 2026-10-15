import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { DownloadTaskRuntimeModule } from '@/download-job/runtime.module';
import { TaskService } from './index.service';
@Module({
  imports: [CommonModule, DownloadTaskRuntimeModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
