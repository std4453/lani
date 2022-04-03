import { ImageResolver } from '@/admin/image.resolver';
import { AdminResolver } from '@/admin/index.resolver';
import { CommonModule } from '@/common/index.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [AdminResolver, ImageResolver],
})
export class AdminModule {}
