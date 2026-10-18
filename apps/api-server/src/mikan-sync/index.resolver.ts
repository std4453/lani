import { MikanSyncService } from '@/mikan-sync/index.service';
import { Int, Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class MikanSyncResolver {
  constructor(private mikansyncService: MikanSyncService) {}

  @Mutation(() => Int, {
    description: 'Returns newly added torrent count',
  })
  async syncMikan() {
    return this.mikansyncService.syncMikan();
  }
}
