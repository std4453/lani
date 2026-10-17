import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { NyaaSyncService } from './index.service';

@Resolver()
export class NyaaSyncResolver {
  constructor(private service: NyaaSyncService) {}

  @Mutation(() => Int)
  syncNyaa() {
    return this.service.syncNyaa();
  }

  @Mutation(() => Int)
  syncNyaaHistory() {
    return this.service.syncNyaaHistory();
  }
}
