import { CommonModule } from '@/common/index.module';
import config from '@/config';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { QBittorrentClient } from '@/download-job/client/QBittorrentClient';
import { QBittorrentService } from '@/download-job/client/QBittorrentService';
import { Module, ModuleMetadata, Provider } from '@nestjs/common';

function getModuleMetadata(): ModuleMetadata {
  const {
    downloadClient: { kind },
  } = config;
  const IDownloadClientProvider: Provider = {
    provide: IDownloadClient,
    useExisting: QBittorrentClient,
  };
  switch (kind) {
    case 'qbittorrent':
      return {
        imports: [CommonModule],
        providers: [
          QBittorrentService,
          QBittorrentClient,
          IDownloadClientProvider,
        ],
        exports: [IDownloadClient],
      };
  }
}

@Module(getModuleMetadata())
export class DownloadClientModule {}
