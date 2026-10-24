import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { MediaPoolService } from './media-pool.service';

@Module({
  imports: [CommonModule],
  providers: [MediaPoolService],
  exports: [MediaPoolService],
})
export class MediaPoolModule {}
