import { AdminResolver } from '@/admin/index.resolver';
import { CommonModule } from '@/common/index.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [AdminResolver],
})
export class AdminModule {}
