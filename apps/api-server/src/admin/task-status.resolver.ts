import { PrismaService } from '@/common/prisma.service';
import { getIdFromNodeId } from '@/utils/graphile';
import { summarizeWorkflow, TaskSummary } from '@lani/workflow';
import { TaskSummaryScalar } from './task-summary.scalar';
import { Logger } from '@nestjs/common';
import {
  Context,
  Directive,
  Field,
  ID,
  ObjectType,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';

@ObjectType('Task')
@Directive('@extends')
@Directive('@key(fields: "nodeId")')
export class Task {
  @Field(() => ID)
  @Directive('@external')
  nodeId: string;
}

@Resolver(() => Task)
export class TaskStatusResolver {
  private readonly logger = new Logger(TaskStatusResolver.name);
  private readonly loaders = new WeakMap<
    object,
    DataLoader<number, TaskSummary | null>
  >();

  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => TaskSummaryScalar, { nullable: true })
  statusSummary(@Parent() { nodeId }: Task, @Context() context: object) {
    let loader = this.loaders.get(context);
    if (!loader) {
      // Federation 只携带任务 ID；同一请求中的摘要合并为一次数据库查询。
      loader = new DataLoader<number, TaskSummary | null>(async (ids) => {
        const tasks = await this.prisma.task.findMany({
          where: { id: { in: [...ids] } },
          select: {
            id: true,
            version: true,
            workflow: true,
            legacyStage: true,
            isFailed: true,
            isCancelled: true,
          },
        });
        const summaries = new Map<number, TaskSummary>(
          tasks.map((task) => {
            const summary: TaskSummary = { version: task.version };
            try {
              if (task.workflow) {
                summary.workflow = summarizeWorkflow(task.workflow);
              } else {
                summary.legacy = {
                  stage: task.legacyStage,
                  isFailed: task.isFailed,
                  isCancelled: task.isCancelled,
                };
              }
            } catch {
              // 单个损坏的流程只影响该任务，不让整批卡片的摘要一起失败。
              this.logger.warn(`Invalid workflow for task ${task.id}`);
            }
            return [task.id, summary];
          }),
        );
        return ids.map((id) => summaries.get(id) ?? null);
      });
      this.loaders.set(context, loader);
    }
    return loader.load(getIdFromNodeId(nodeId));
  }
}
