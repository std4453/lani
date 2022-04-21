import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MikanRSSItem {
  hash: string;
  link: string;
  title: string;
  @Field(() => BigInt)
  size: bigint;
  publishDate: Date;
  torrentLink: string;
}
