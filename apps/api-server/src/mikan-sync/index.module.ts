import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { MikanSyncResolver } from '@/mikan-sync/index.resolver';
import { MikanSyncService } from '@/mikan-sync/index.service';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [FetchMikanModule],
  providers: [MikanSyncService, MikanSyncResolver, PrismaService],
})
export class MikanSyncModule {}
