import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MikanRSSItem {
  hash: string;
  link: string;
  title: string;
  size: string;
  publishDate: Date;
  torrentLink: string;
}
