import { LegacyTaskStage, TaskType } from '@lani/db';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Workflow } from '@lani/workflow';
import { WorkflowScalar } from './workflow.scalar';

registerEnumType(LegacyTaskStage, { name: 'LegacyTaskStage' });
registerEnumType(TaskType, { name: 'TaskType' });

@ObjectType()
export class TaskEpisodeState {
  @Field(() => Int) id: number;
  @Field(() => Int, { nullable: true }) episodeId?: number | null;
  @Field(() => String, { nullable: true }) sourcePath?: string | null;
  @Field(() => String, { nullable: true }) importPath?: string | null;
  @Field(() => String, { nullable: true }) filePath?: string | null;
  @Field(() => String, { nullable: true }) nfoPath?: string | null;
  @Field(() => String, { nullable: true }) jellyfinEpisodeId?: string | null;
}

@ObjectType()
export class TaskState {
  @Field(() => [TaskEpisodeState]) entries: TaskEpisodeState[];
  @Field(() => Int) id: number;
  @Field(() => TaskType) type: TaskType;
  @Field(() => Int) version: number;
  @Field(() => WorkflowScalar, { nullable: true })
  workflow: Workflow | null;
  @Field(() => LegacyTaskStage) legacyStage: LegacyTaskStage;
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
