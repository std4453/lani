import { CommonModule } from '@/common/index.module';
import { Module } from '@nestjs/common';
import { BackgroundQueueService } from './index.service';

@Module({
  imports: [CommonModule],
  providers: [BackgroundQueueService],
  exports: [BackgroundQueueService],
})
export class BackgroundQueueModule {}
