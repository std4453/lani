import { CommonModule } from '@/common/index.module';
import { LaniaService } from '@/integrations/lania/LaniaService';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [LaniaService],
})
export class LaniaModule {}
