import { CommonModule } from '@/common/index.module';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [FetchMikanService],
  exports: [FetchMikanService],
})
export class FetchMikanModule {}
