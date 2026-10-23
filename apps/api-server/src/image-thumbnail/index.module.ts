import { CommonModule } from '@/common/index.module';
import { BackgroundQueueModule } from '@/background-queue/index.module';
import { Module } from '@nestjs/common';
import { ImageThumbnailService } from './index.service';

@Module({
  imports: [CommonModule, BackgroundQueueModule],
  providers: [ImageThumbnailService],
  exports: [ImageThumbnailService],
})
export class ImageThumbnailModule {}
