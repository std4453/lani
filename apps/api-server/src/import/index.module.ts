import { CommonModule } from '@/common/index.module';
import { ImportResolver } from '@/import/index.resolver';
import { ImportService } from '@/import/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [ImportService, ImportResolver],
})
export class ImportModule {}
