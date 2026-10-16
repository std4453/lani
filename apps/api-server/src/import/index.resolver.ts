import { ImportMultipleEntry } from '@/import/index.model';
import { ImportService } from '@/import/index.service';
import { Injectable, Logger } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

@Injectable()
@Resolver()
export class ImportResolver {
  private readonly logger = new Logger(ImportResolver.name);

  constructor(private importService: ImportService) {}

  @Mutation(() => Int)
  async importSingle(
    @Args('episodeId') episodeId: number,
    @Args('importPath') importPath: string,
  ) {
    return this.importService.importSingle(episodeId, importPath);
  }

  @Mutation(() => Int)
  async importMultiple(
    @Args({
      name: 'entries',
      type: () => [ImportMultipleEntry],
    })
    entries: ImportMultipleEntry[],
  ) {
    return this.importService.importMultiple(entries);
  }
}
