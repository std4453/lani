import { PrismaService } from '@/common/prisma.service';
import { DownloadTaskRuntime } from '@/download-job/runtime';
import { LaniError } from '@/utils/error';
import { DownloadStatus, Prisma, TaskType } from '@lani/db';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  parseWorkflow,
  requestCancellation,
  retryWorkflow,
} from '@lani/download-workflow';
import { DownloadLifecycle } from './index.model';
import { TaskRuntime } from './workflow-runner';
@Injectable()
@Resolver()
export class TaskService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private runtimes: Record<TaskType, TaskRuntime>;
  constructor(private prisma: PrismaService, download: DownloadTaskRuntime) {
    this.runtimes = { [TaskType.DOWNLOAD]: download };
  }
  private async runtime(jobId: number, operation: '重试' | '取消') {
    const job = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
    });
    if (!job.workflow) throw new LaniError(`旧任务不允许${operation}`);
    return this.runtimes[job.type];
  }
  @Mutation(() => ID)
  async retryJobStep(@Args('jobId') jobId: number) {
    const runtime = await this.runtime(jobId, '重试');
    await runtime.transition(jobId, (workflow) =>
      retryWorkflow(workflow, new Date().toISOString()),
    );
    void runtime.start(jobId);
    return 'ok';
  }
  @Mutation(() => ID)
  async cancelDownloadJob(@Args('jobId') jobId: number) {
    const runtime = await this.runtime(jobId, '取消');
    await runtime.transition(jobId, (workflow) =>
      requestCancellation(workflow, new Date().toISOString()),
    );
    void runtime.start(jobId);
    return 'ok';
  }
  @Query(() => [DownloadLifecycle])
  async getDownloadJobStates(
    @Args({ name: 'jobIds', type: () => [Int] }) jobIds: number[],
  ) {
    if (!jobIds.length) return [];
    const jobs = await this.prisma.downloadJob.findMany({
      where: { id: { in: jobIds } },
    });
    return jobs.map((job) => {
      const workflow = job.workflow ? parseWorkflow(job.workflow) : null;
      return {
        ...job,
        workflow,
        canRetry: !!workflow && workflow.status === 'failed',
        canCancel:
          !!workflow &&
          !workflow.cancellation &&
          workflow.status !== 'succeeded' &&
          workflow.status !== 'cancelled',
      };
    });
  }
  async onApplicationBootstrap() {
    await this.prisma.downloadJob.updateMany({
      where: {
        workflow: { equals: Prisma.DbNull },
        isFailed: false,
        isCancelled: false,
        status: { not: DownloadStatus.AVAILABLE },
      },
      data: {
        isFailed: true,
        failedAt: new Date(),
        failedReason: '',
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
    const jobs = await this.prisma.downloadJob.findMany({
      where: {
        workflow: { not: Prisma.DbNull },
        isFailed: false,
        isCancelled: false,
        status: { not: DownloadStatus.AVAILABLE },
      },
    });
    for (const job of jobs) void this.runtimes[job.type].start(job.id);
  }
  async onApplicationShutdown() {
    await Promise.all(
      Object.values(this.runtimes).map((runtime) => runtime.stop()),
    );
  }
}
