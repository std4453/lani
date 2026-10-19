jest.mock('./index.service', () => ({ NyaaSyncService: class {} }));
jest.mock('./metadata.service', () => ({ NyaaMetadataService: class {} }));

import { ApolloFederationDriver } from '@nestjs/apollo';
import {
  GraphQLModule,
  GraphQLSchemaHost,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { graphql } from 'graphql';
import { NyaaSyncResolver } from './index.resolver';
import { NyaaSyncService } from './index.service';
import { NyaaMetadataService } from './metadata.service';

@Resolver()
class ProbeResolver {
  @Query(() => Boolean)
  probe() {
    return true;
  }
}

it('exposes refresh only as a mutation with required integer IDs and returns the queued count', async () => {
  const metadata = { refreshMetadata: jest.fn().mockResolvedValue(2) };
  const module = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot({
        driver: ApolloFederationDriver,
        autoSchemaFile: true,
      }),
    ],
    providers: [
      NyaaSyncResolver,
      ProbeResolver,
      { provide: NyaaSyncService, useValue: {} },
      { provide: NyaaMetadataService, useValue: metadata },
    ],
  }).compile();
  const app = module.createNestApplication();
  await app.init();
  try {
    const schema = app.get(GraphQLSchemaHost).schema;
    expect(schema.getQueryType()?.getFields()).not.toHaveProperty(
      'refreshNyaaMetadata',
    );
    const field = schema.getMutationType()?.getFields().refreshNyaaMetadata;
    expect(String(field?.type)).toBe('Int!');
    expect(String(field?.args[0].type)).toBe('[Int!]!');
    const source = 'mutation($ids: [Int!]!) { refreshNyaaMetadata(ids: $ids) }';
    const result = await graphql({
      schema,
      source,
      variableValues: { ids: [1, 2] },
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.refreshNyaaMetadata).toBe(2);
    expect(metadata.refreshMetadata).toHaveBeenCalledWith([1, 2]);
    for (const ids of [[null], [1.5], null]) {
      const invalid = await graphql({
        schema,
        source,
        variableValues: { ids },
      });
      expect(invalid.errors).toBeDefined();
    }
    expect(metadata.refreshMetadata).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});
