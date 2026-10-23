import { MediaPoolService } from '@/media-pool/media-pool.service';
import { FindImportFilesAtom } from './atoms/find-import-files.atom';
import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/index.module';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
import { TaskService } from './index.service';
import { TaskStore } from './task-store';
import { SubmitDownloadAtom } from './atoms/submit-download.atom';
import { DownloadAtom } from './atoms/download-atom';
import { FindVideoFileAtom } from './atoms/find-video-file.atom';
import { ImportFileAtom } from './atoms/import-file.atom';
import { WriteMetadataAtom } from './atoms/write-metadata.atom';
import { RefreshPlayerAtom } from './atoms/refresh-player.atom';
import { PublishEpisodeAtom } from './atoms/publish-episode.atom';
import { DownloadRefreshService } from './atoms/refresh/download-refresh.service';
import { PlayerRefreshService } from './atoms/refresh/player-refresh.service';
@Module({
  imports: [CommonModule, DownloadClientModule],
  providers: [
    MediaPoolService,
    TaskService,
    TaskStore,
    SubmitDownloadAtom,
    DownloadAtom,
    FindVideoFileAtom,
    FindImportFilesAtom,
    ImportFileAtom,
    WriteMetadataAtom,
    RefreshPlayerAtom,
    PublishEpisodeAtom,
    DownloadRefreshService,
    PlayerRefreshService,
  ],
  exports: [TaskService],
})
export class TaskModule {}
