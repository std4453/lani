import { CommonModule } from '@/common/index.module';
import { FetchMikanResolver } from '@/fetch-mikan/index.resolver';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [FetchMikanService, FetchMikanResolver],
  exports: [FetchMikanService],
})
export class FetchMikanModule {}
