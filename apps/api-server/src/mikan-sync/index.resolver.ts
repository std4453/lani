import { MikanSyncService } from '@/mikan-sync/index.service';
import { ID, Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class MikanSyncResolver {
  constructor(private mikansyncService: MikanSyncService) {}

  @Mutation(() => ID)
  async syncMikan() {
    await this.mikansyncService.syncMikan();
    return '';
  }
}
