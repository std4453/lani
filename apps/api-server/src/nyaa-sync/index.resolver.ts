import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { NyaaSyncService } from './index.service';
import { NyaaMetadataService } from './metadata.service';

@Resolver()
export class NyaaSyncResolver {
  constructor(
    private service: NyaaSyncService,
    private metadata: NyaaMetadataService,
  ) {}

  @Mutation(() => Int)
  syncNyaa() {
    return this.service.syncNyaa();
  }

  @Mutation(() => Int, {
    description:
      '按数据库种子 ID 刷新 Nyaa 字幕元数据（1–100 条），返回新入队数量。已在队列中的记录不重复入队；后台按分钟处理，限流期间继续等待。',
  })
  refreshNyaaMetadata(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.metadata.refreshMetadata(ids);
  }
}
