import { PrismaService } from '@/common/prisma.service';
import { getIdFromNodeId } from '@/utils/graphile';
import { taskDisplayStatus, TaskDisplayStatus } from '@lani/workflow';
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
  private readonly loaders = new WeakMap<
    object,
    DataLoader<number, TaskDisplayStatus | null>
  >();

  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => String, { nullable: true })
  statusSummary(@Parent() { nodeId }: Task, @Context() context: object) {
    let loader = this.loaders.get(context);
    if (!loader) {
      // Federation 只携带任务 ID；同一请求中的摘要合并为一次数据库查询。
      loader = new DataLoader<number, TaskDisplayStatus | null>(async (ids) => {
        const tasks = await this.prisma.task.findMany({
          where: { id: { in: [...ids] } },
          select: {
            id: true,
            workflow: true,
            legacyStage: true,
            isFailed: true,
            isCancelled: true,
          },
        });
        const summaries = new Map<number, TaskDisplayStatus | Error>(
          tasks.map((task) => {
            try {
              return [task.id, taskDisplayStatus(task)];
            } catch (error) {
              // 单个损坏的流程只影响该任务，不让整批卡片的摘要一起失败。
              return [
                task.id,
                error instanceof Error ? error : new Error(String(error)),
              ];
            }
          }),
        );
        return ids.map((id) => summaries.get(id) ?? null);
      });
      this.loaders.set(context, loader);
    }
    return loader.load(getIdFromNodeId(nodeId));
  }
}
