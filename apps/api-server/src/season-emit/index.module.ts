import { SeasonMediaService } from './media.service';
import { MediaPoolModule } from '@/media-pool/index.module';
import { CommonModule } from '@/common/index.module';
import { SeasonEmitResolver } from '@/season-emit/index.resolver';
import { SeasonEmitService } from '@/season-emit/index.service';
import { SeasonJellyfinModule } from '@/season-jellyfin/SeasonJellyfinModule';
import { Module } from '@nestjs/common';

@Module({
  providers: [SeasonMediaService, SeasonEmitService, SeasonEmitResolver],
  exports: [SeasonEmitService, SeasonMediaService],
  imports: [CommonModule, SeasonJellyfinModule, MediaPoolModule],
})
export class SeasonEmitModule {}
