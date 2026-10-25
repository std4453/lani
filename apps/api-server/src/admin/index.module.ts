import { TaskStatusResolver } from './task-status.resolver';
import { MediaPoolModule } from '@/media-pool/index.module';
import { TorrentSubtitleResolver } from './torrent-subtitle.resolver';
import { JellyfinFolderResolver } from '@/admin/JellyfinFolderResolver';
import { ImageResolver } from '@/admin/image.resolver';
import { AdminResolver } from '@/admin/index.resolver';
import { CommonModule } from '@/common/index.module';
import { DownloadJobModule } from '@/download-job/index.module';
import { SeasonEmitModule } from '@/season-emit/index.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DownloadClientModule } from '@/download-client/DownloadClientModule';
import { FilesResolver } from '@/admin/files.resolver';
import { ImageThumbnailModule } from '@/image-thumbnail/index.module';

@Module({
  imports: [
    MediaPoolModule,
    ImageThumbnailModule,
    CommonModule,
    ConfigModule,
    DownloadJobModule,
    SeasonEmitModule,
    DownloadClientModule,
  ],
  providers: [
    AdminResolver,
    TorrentSubtitleResolver,
    TaskStatusResolver,
    ImageResolver,
    JellyfinFolderResolver,
    FilesResolver,
  ],
})
export class AdminModule {}
