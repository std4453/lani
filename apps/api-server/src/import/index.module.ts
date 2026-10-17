import { TaskModule } from '@/task/index.module';
import { CommonModule } from '@/common/index.module';
import { ImportResolver } from '@/import/index.resolver';
import { ImportService } from '@/import/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule, TaskModule],
  providers: [ImportService, ImportResolver],
})
export class ImportModule {}
