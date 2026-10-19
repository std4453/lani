// 使用已构建的 API 与原始 Data Server schema，验证真实 Federation 查询计划。
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const path = require("node:path");
const root = path.resolve(__dirname, "../../..");
const apiRequire = createRequire(
  path.join(root, "apps/api-server/package.json")
);
const dataRequire = createRequire(
  path.join(root, "apps/data-server/package.json")
);
const gatewayRequire = createRequire(
  path.join(root, "apps/gateway/package.json")
);
apiRequire("reflect-metadata");
const { Test } = apiRequire("@nestjs/testing");
const { GraphQLModule, GraphQLSchemaHost, Resolver, Query } =
  apiRequire("@nestjs/graphql");
const { ApolloFederationDriver } = apiRequire("@nestjs/apollo");
const { graphql, parse } = apiRequire("graphql");
const { Torrent, TorrentSubtitleResolver } = apiRequire(
  "./dist/admin/torrent-subtitle.resolver"
);
const { postgraphile, withPostGraphileContext } = dataRequire("postgraphile");
const federation = dataRequire("@graphile/federation").default;
const { ApolloGateway, LocalGraphQLDataSource } =
  gatewayRequire("@apollo/gateway");
const { ApolloServer } = gatewayRequire("apollo-server-express");

class Probe {
  probe() {
    return true;
  }
}
Resolver()(Probe);
Query(() => Boolean)(
  Probe.prototype,
  "probe",
  Object.getOwnPropertyDescriptor(Probe.prototype, "probe")
);

async function main() {
  const module = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot({
        driver: ApolloFederationDriver,
        autoSchemaFile: true,
        buildSchemaOptions: { orphanedTypes: [Torrent] },
      }),
    ],
    providers: [TorrentSubtitleResolver, Probe],
  }).compile();
  const api = module.createNestApplication();
  const data = postgraphile(
    process.env.LANI_METADATA_TEST_DATABASE_URL,
    "public",
    { dynamicJson: true, appendPlugins: [federation] }
  );
  let server;
  try {
    await api.init();
    const schemas = {
      api: api.get(GraphQLSchemaHost).schema,
      data: await data.getGraphQLSchema(),
    };
    const localServiceList = await Promise.all(
      Object.entries(schemas).map(async ([name, schema]) => {
        const result = await graphql({
          schema,
          source: "{ _service { sdl } }",
        });
        assert.equal(result.errors, undefined, JSON.stringify(result.errors));
        return { name, typeDefs: parse(result.data._service.sdl) };
      })
    );
    let context;
    const gateway = new ApolloGateway({
      localServiceList,
      buildService: ({ name }) => new LocalGraphQLDataSource(schemas[name]),
    });
    server = new ApolloServer({ gateway, context: () => context });
    await withPostGraphileContext({ pgPool: data.pgPool }, async (value) => {
      context = value;
      const original = context.pgClient.query.bind(context.pgClient);
      let statements = 0;
      context.pgClient.query = (...args) => {
        statements++;
        return original(...args);
      };
      try {
        const result = await server.executeOperation({
          query:
            "{ allTorrents(orderBy: ID_ASC) { nodes { id subtitleInfo alias: subtitleInfo } } }",
        });
        assert.equal(result.errors, undefined, JSON.stringify(result.errors));
        assert.equal(
          statements,
          1,
          "list + subtitle enrichment should use one SQL query"
        );
        const rows = result.data.allTorrents.nodes;
        assert.deepEqual(rows[0].subtitleInfo, {
          languages: ["en", "zh-Hant"],
          multi: true,
          delivery: ["muxed"],
        });
        assert.deepEqual(rows[0].alias, rows[0].subtitleInfo);
        assert.deepEqual(rows[1].subtitleInfo, {
          languages: ["zh-Hans"],
          multi: false,
          delivery: ["muxed"],
        });
        assert.equal(rows[2].subtitleInfo, null);
      } finally {
        context.pgClient.query = original;
      }
    });
    console.log(
      "Federated subtitles: composition, list, aliases, legacy fallback and single SQL query passed"
    );
  } finally {
    if (server) await server.stop();
    await data.release();
    await api.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
