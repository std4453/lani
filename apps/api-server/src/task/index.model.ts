import { DownloadStatus, TaskType } from '@lani/db';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DownloadWorkflow } from '@lani/download-workflow';
import { DownloadWorkflowScalar } from './workflow.scalar';

registerEnumType(DownloadStatus, { name: 'DownloadStatus' });
registerEnumType(TaskType, { name: 'TaskType' });

@ObjectType()
export class DownloadLifecycle {
  @Field(() => Int) id: number;
  @Field(() => TaskType) type: TaskType;
  @Field(() => Int) version: number;
  @Field(() => DownloadWorkflowScalar, { nullable: true })
  workflow: DownloadWorkflow | null;
  @Field(() => DownloadStatus) status: DownloadStatus;
  @Field() isFailed: boolean;
  @Field() isCancelled: boolean;
  @Field() failedReason: string;
  @Field(() => String, { nullable: true }) qbtTorrentHash?: string | null;
  @Field(() => String, { nullable: true }) torrentTitle?: string | null;
  @Field(() => String, { nullable: true }) downloadPath?: string | null;
  @Field(() => String, { nullable: true }) importPath?: string | null;
  @Field(() => String, { nullable: true }) filePath?: string | null;
  @Field(() => String, { nullable: true }) nfoPath?: string | null;
  @Field(() => String, { nullable: true }) jellyfinEpisodeId?: string | null;
  @Field() canRetry: boolean;
  @Field() canCancel: boolean;
}
