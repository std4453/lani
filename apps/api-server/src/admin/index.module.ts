import { ImageResolver } from '@/admin/image.resolver';
import { AdminResolver } from '@/admin/index.resolver';
import { CommonModule } from '@/common/index.module';
import { DownloadJobModule } from '@/download-job/index.module';
import { SeasonEmitModule } from '@/season-emit/index.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule, DownloadJobModule, SeasonEmitModule],
  providers: [AdminResolver, ImageResolver],
})
export class AdminModule {}
