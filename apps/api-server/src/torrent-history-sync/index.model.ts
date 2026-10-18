import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TorrentHistorySync {
  @Field()
  running: boolean;

  @Field(() => Int)
  added: number;

  @Field(() => String, { nullable: true })
  error: string | null;
}
