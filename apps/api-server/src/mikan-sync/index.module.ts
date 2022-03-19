import { CommonModule } from '@/common/index.module';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { MikanSyncResolver } from '@/mikan-sync/index.resolver';
import { MikanSyncService } from '@/mikan-sync/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [FetchMikanModule, CommonModule],
  providers: [MikanSyncService, MikanSyncResolver],
})
export class MikanSyncModule {}
