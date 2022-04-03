import { CommonModule } from '@/common/index.module';
import { DownloadAtom } from '@/download-job/atoms/download-atom';
import { FindVideoFileAtom } from '@/download-job/atoms/find-video-file.atom';
import { ImportFileAtom } from '@/download-job/atoms/import-file.atom';
import { RefreshPlayerAtom } from '@/download-job/atoms/refresh-player.atom';
import { SubmitDownloadAtom } from '@/download-job/atoms/submit-download.atom';
import { WriteMetadataAtom } from '@/download-job/atoms/write-metadata.atom';
import { JobService } from '@/download-job/index.service';
import { QBittorrentService } from '@/download-job/qbt.service';
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
export class DownloadJobModule {}
