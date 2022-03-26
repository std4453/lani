import { CommonModule } from '@/common/index.module';
import { JobService } from '@/job/index.service';
import { QBittorrentService } from '@/job/qbt.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [QBittorrentService, JobService],
})
export class JobModule {}
