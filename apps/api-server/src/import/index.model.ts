import { InputType } from '@nestjs/graphql';

@InputType()
export class ImportMultipleEntry {
  episodeId: number;
  importPath: string;
}
