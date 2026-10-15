import { Injectable, Logger } from '@nestjs/common';
import { WorkflowRuntime } from '@/task/runtime';
import { Atoms } from '@/task/workflow-runner';
import { DownloadTaskStore } from './task-store';
import { DownloadAtom } from './atoms/download-atom';
import { FindVideoFileAtom } from './atoms/find-video-file.atom';
import { ImportFileAtom } from './atoms/import-file.atom';
import { RefreshPlayerAtom } from './atoms/refresh-player.atom';
import { SubmitDownloadAtom } from './atoms/submit-download.atom';
import { DownloadWorkflowDefinition } from './atoms/types';
import { WriteMetadataAtom } from './atoms/write-metadata.atom';
@Injectable()
export class DownloadTaskRuntime extends WorkflowRuntime<DownloadWorkflowDefinition> {
  private atoms: Atoms<DownloadWorkflowDefinition>;
  constructor(
    private downloadStore: DownloadTaskStore,
    submitDownload: SubmitDownloadAtom,
    download: DownloadAtom,
    findVideoFile: FindVideoFileAtom,
    importFile: ImportFileAtom,
    writeMetadata: WriteMetadataAtom,
    refreshPlayer: RefreshPlayerAtom,
  ) {
    super(
      downloadStore,
      {
        submitDownload,
        download,
        findVideoFile,
        importFile,
        writeMetadata,
        refreshPlayer,
      },
      (error) => new Logger(DownloadTaskRuntime.name).error(error),
    );
    this.atoms = {
      submitDownload,
      download,
      findVideoFile,
      importFile,
      writeMetadata,
      refreshPlayer,
    };
  }
  async create(episodeId: number, torrentLink: string) {
    const id = await this.downloadStore.create(
      episodeId,
      torrentLink,
      this.atoms,
    );
    void this.start(id);
    return id;
  }
}
