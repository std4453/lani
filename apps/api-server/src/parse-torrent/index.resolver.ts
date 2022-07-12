import { env } from '@/env';
import { ParseTorrentService } from '@/parse-torrent/index.service';
import { ForbiddenException } from '@nestjs/common';
import { ID, Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class ParseTorrentResolver {
  constructor(private parseTorrentService: ParseTorrentService) {}

  @Mutation(() => ID)
  async parseTorrentTitleForAll() {
    if (env !== 'dev') {
      throw new ForbiddenException('only available in dev mode');
    }
    await this.parseTorrentService.parseTorrentTitleForAll();
    return 'ok';
  }
}
