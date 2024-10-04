import { ImportMultipleEntry } from '@/import/index.model';
import { ImportService } from '@/import/index.service';
import { Injectable, Logger } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

@Injectable()
@Resolver()
export class ImportResolver {
  private readonly logger = new Logger(ImportResolver.name);

  constructor(private importService: ImportService) {}

  @Mutation(() => ID)
  async importSingle(
    @Args('episodeId') episodeId: number,
    @Args('importPath') importPath: string,
  ) {
    await this.importService.importSingle(episodeId, importPath);
    return 'ok';
  }

  @Mutation(() => ID)
  async importMultiple(
    @Args({
      name: 'entries',
      type: () => [ImportMultipleEntry],
    })
    entries: ImportMultipleEntry[],
  ) {
    // TODO: 异步任务

    await Promise.all(
      entries.map((entry) =>
        this.importService.importSingle(entry.episodeId, entry.importPath),
      ),
    );

    return 'ok';
  }
}
