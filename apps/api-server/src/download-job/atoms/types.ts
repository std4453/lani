export interface DownloadWorkflowInput {
  episodeId: number;
  torrentLink: string;
}

export interface SubmitDownloadOutput {
  qbtTorrentHash: string;
}

export type DownloadWorkflowDefinition = {
  params: {
    episodeId: number;
    torrentLink: string;
  };
  steps: {
    submitDownload: {
      output: {
        qbtTorrentHash: string;
      };
    };
    download: {
      output: {
        downloadPath: string;
      };
    };
    findVideoFile: {
      output: {
        importPath: string;
      };
    };
    importFile: {
      output: {
        filePath: string;
      };
    };
    writeMetadata: {
      output: {
        nfoPath: string;
      };
    };
    refreshPlayer: {
      output: {
        jellyfinEpisodeId: string;
      };
    };
  };
};
