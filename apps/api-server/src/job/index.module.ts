import { CommonModule } from '@/common/index.module';
import { DownloadAtom } from '@/job/atoms/download-atom';
import { FindVideoFileAtom } from '@/job/atoms/find-video-file.atom';
import { ImportFileAtom } from '@/job/atoms/import-file.atom';
import { RefreshPlayerAtom } from '@/job/atoms/refresh-player.atom';
import { SubmitDownloadAtom } from '@/job/atoms/submit-download.atom';
import { WriteMetadataAtom } from '@/job/atoms/write-metadata.atom';
import { JobService } from '@/job/index.service';
import { QBittorrentService } from '@/job/qbt.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [
    QBittorrentService,
    SubmitDownloadAtom,
    DownloadAtom,
    FindVideoFileAtom,
    ImportFileAtom,
    WriteMetadataAtom,
    RefreshPlayerAtom,
    JobService,
  ],
})
export class JobModule {}
