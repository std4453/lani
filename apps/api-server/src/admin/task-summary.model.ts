import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TaskStepSummary {
  @Field() id: string;
  @Field() atom: string;
  @Field() title: string;
  @Field() status: string;
}

@ObjectType()
export class TaskWorkflowSummary {
  @Field() status: string;
  @Field() currentStepId: string;
  @Field(() => [TaskStepSummary]) steps: TaskStepSummary[];
}

@ObjectType()
export class LegacyTaskSummary {
  @Field() stage: string;
  @Field() isFailed: boolean;
  @Field() isCancelled: boolean;
}

@ObjectType()
export class TaskStatusSummary {
  @Field(() => Int) version: number;
  @Field(() => TaskWorkflowSummary, { nullable: true })
  workflow?: TaskWorkflowSummary;
  @Field(() => LegacyTaskSummary, { nullable: true })
  legacy?: LegacyTaskSummary;
}
