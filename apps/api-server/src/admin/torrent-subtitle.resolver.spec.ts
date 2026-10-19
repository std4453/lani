import { ApolloFederationDriver } from '@nestjs/apollo';
import {
  GraphQLModule,
  GraphQLSchemaHost,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { graphql } from 'graphql';
import { Torrent, TorrentSubtitleResolver } from './torrent-subtitle.resolver';

@Resolver()
class ProbeResolver {
  @Query(() => Boolean)
  probe() {
    return true;
  }
}

it('exposes subtitleInfo through Federation requirements and resolves supplied rows without database access', async () => {
  const module = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot({
        driver: ApolloFederationDriver,
        autoSchemaFile: true,
        buildSchemaOptions: { orphanedTypes: [Torrent] },
      }),
    ],
    providers: [TorrentSubtitleResolver, ProbeResolver],
  }).compile();
  const app = module.createNestApplication();
  await app.init();
  try {
    const schema = app.get(GraphQLSchemaHost).schema;
    const execute = async (
      source: string,
      variableValues?: Record<string, unknown>,
    ) => {
      const result = await graphql({ schema, source, variableValues });
      expect(result.errors).toBeUndefined();
      return result.data as any;
    };
    const service = await execute('{ _service { sdl } }');
    expect(service._service.sdl).toContain(
      '@requires(fields: "parseVersion parseResult metadata subtitleHasChs subtitleHasCht subtitleHasJp subtitleType")',
    );
    const result = await execute(
      'query($rows: [_Any!]!) { _entities(representations: $rows) { ... on Torrent { subtitleInfo alias: subtitleInfo } } }',
      {
        rows: [
          {
            __typename: 'Torrent',
            nodeId: 'test',
            parseVersion: 1,
            parseResult: {
              subtitleInfo: { languages: ['en'], multi: false, delivery: [] },
            },
            metadata: {
              status: 'known',
              subtitleInfo: {
                languages: ['zh-Hant'],
                multi: false,
                delivery: ['muxed'],
              },
            },
            subtitleHasChs: true,
            subtitleHasCht: false,
            subtitleHasJp: false,
            subtitleType: null,
          },
        ],
      },
    );
    expect(result._entities[0].subtitleInfo).toEqual({
      languages: ['en', 'zh-Hant'],
      multi: true,
      delivery: ['muxed'],
    });
    expect(result._entities[0].alias).toEqual(result._entities[0].subtitleInfo);
  } finally {
    await app.close();
  }
});
