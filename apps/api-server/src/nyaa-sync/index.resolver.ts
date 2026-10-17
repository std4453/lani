import { Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NyaaSyncService } from './index.service';
import { NyaaHistorySync } from './index.model';

@Resolver()
export class NyaaSyncResolver {
  constructor(private service: NyaaSyncService) {}

  @Mutation(() => Int)
  syncNyaa() {
    return this.service.syncNyaa();
  }

  @Mutation(() => NyaaHistorySync)
  syncNyaaHistory() {
    return this.service.startHistorySync();
  }

  @Query(() => NyaaHistorySync)
  nyaaHistorySync() {
    return this.service.getHistorySync();
  }
}
