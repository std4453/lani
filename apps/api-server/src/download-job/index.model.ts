import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RefreshDownloadResult {
  changed: boolean;
}
