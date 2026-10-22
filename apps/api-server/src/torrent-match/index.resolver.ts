import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { TorrentMatchService } from './index.service';

@Resolver()
export class TorrentMatchResolver {
  constructor(private readonly matching: TorrentMatchService) {}

  @Mutation(() => Int, {
    description: '批量加入季度识别队列，返回实际入队数量；默认仅处理未识别种子',
  })
  enqueueTorrentSeasonMatches(
    @Args('torrentIds', { type: () => [Int] }) ids: number[],
    @Args('rematch', { type: () => Boolean, defaultValue: false })
    rematch: boolean,
  ) {
    return this.matching.enqueueBatch(ids, rematch);
  }

  @Mutation(() => Boolean)
  cancelTorrentSeasonMatch(@Args('torrentId', { type: () => Int }) id: number) {
    return this.matching.cancelAssociation(id);
  }
}
