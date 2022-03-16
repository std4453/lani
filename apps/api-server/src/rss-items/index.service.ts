import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class RSSItemsService {
  constructor(@InjectGraphQLClient() private readonly client: GraphQLClient) {}
}
