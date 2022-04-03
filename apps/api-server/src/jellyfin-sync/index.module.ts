import { CommonModule } from '@/common/index.module';
import { JellyfinSyncService } from '@/jellyfin-sync/index.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [JellyfinSyncService],
  exports: [JellyfinSyncService],
})
export class JellyfinSyncModule {}
