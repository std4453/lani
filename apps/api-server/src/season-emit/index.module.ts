import { CommonModule } from '@/common/index.module';
import { SeasonEmitResolver } from '@/season-emit/index.resolver';
import { SeasonEmitService } from '@/season-emit/index.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [SeasonEmitService, SeasonEmitResolver],
  exports: [SeasonEmitService],
  imports: [CommonModule],
})
export class SeasonEmitModule {}
