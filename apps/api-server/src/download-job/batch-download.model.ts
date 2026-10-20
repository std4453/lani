import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TorrentPreviewFile {
  path: string;
  @Field(() => Float)
  size: number;
}

@ObjectType()
export class TorrentPreview {
  token: string;
  @Field(() => [TorrentPreviewFile])
  files: TorrentPreviewFile[];
}

@InputType()
export class BatchDownloadEntry {
  episodeId: number;
  path: string;
}
