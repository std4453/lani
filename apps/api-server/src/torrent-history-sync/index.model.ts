import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TorrentHistorySync {
  @Field()
  running: boolean;

  @Field(() => String, { nullable: true })
  error: string | null;
}
