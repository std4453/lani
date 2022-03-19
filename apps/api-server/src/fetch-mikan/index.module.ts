import { CommonModule } from '@/common/index.module';
import { FetchMikanResolver } from '@/fetch-mikan/index.resolver';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule, HttpModule],
  providers: [FetchMikanService, FetchMikanResolver],
  exports: [FetchMikanService],
})
export class FetchMikanModule {}
