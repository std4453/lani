import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TorrentHistorySyncState {
  @Field()
  running: boolean;

  @Field(() => Int)
  added: number;

  @Field(() => String, { nullable: true })
  error: string | null;
}
