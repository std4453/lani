import { CommonModule } from '@/common/index.module';
import { DownloadAtom } from '@/download-job/atoms/download-atom';
import { FindVideoFileAtom } from '@/download-job/atoms/find-video-file.atom';
import { ImportFileAtom } from '@/download-job/atoms/import-file.atom';
import { RefreshPlayerAtom } from '@/download-job/atoms/refresh-player.atom';
import { SubmitDownloadAtom } from '@/download-job/atoms/submit-download.atom';
import { WriteMetadataAtom } from '@/download-job/atoms/write-metadata.atom';
import { DownloadClientModule } from '@/download-job/client/DownloadClientModule';
import { DownloadTaskStore } from './task-store';
import { DownloadTaskRuntime } from './runtime';
import { DownloadRefreshService } from './atoms/refresh/download-refresh.service';
import { PlayerRefreshService } from './atoms/refresh/player-refresh.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule, DownloadClientModule],
  providers: [
    SubmitDownloadAtom,
    DownloadAtom,
    FindVideoFileAtom,
    ImportFileAtom,
    WriteMetadataAtom,
    RefreshPlayerAtom,
    DownloadTaskStore,
    DownloadTaskRuntime,
    DownloadRefreshService,
    PlayerRefreshService,
  ],
  exports: [DownloadTaskRuntime],
})
export class DownloadTaskRuntimeModule {}
