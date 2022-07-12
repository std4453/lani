import { CommonModule } from '@/common/index.module';
import { ParseTorrentResolver } from '@/parse-torrent/index.resolver';
import { ParseTorrentService } from '@/parse-torrent/index.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule],
  providers: [ParseTorrentService, ParseTorrentResolver],
  exports: [ParseTorrentService],
})
export class ParseTorrentModule {}
