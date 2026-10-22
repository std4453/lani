import { CommonModule } from '@/common/index.module';
import { DiscoveryModule } from '@nestjs/core';
import { QueueExplorer } from './explorer';
import { Module } from '@nestjs/common';
import { BackgroundQueueService } from './index.service';

@Module({
  imports: [CommonModule, DiscoveryModule],
  providers: [BackgroundQueueService, QueueExplorer],
  exports: [BackgroundQueueService],
})
export class BackgroundQueueModule {}
