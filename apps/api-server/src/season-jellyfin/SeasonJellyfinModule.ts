import { CommonModule } from '@/common/index.module';
import { SeasonJellyfinResolver } from '@/season-jellyfin/SeasonJellyfinResolver';
import { SeasonJellyfinService } from '@/season-jellyfin/SeasonJellyfinService';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [SeasonJellyfinService, SeasonJellyfinResolver],
  exports: [SeasonJellyfinService],
})
export class SeasonJellyfinModule {}
