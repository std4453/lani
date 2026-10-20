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
const { PrismaClient } = apiRequire("@lani/db");
// 仅替换依赖注入令牌，避免加载应用配置；查询仍由真实 Prisma Client 执行。
class PrismaService {}
const prismaServicePath = apiRequire.resolve("./dist/common/prisma.service");
require.cache[prismaServicePath] = {
  id: prismaServicePath,
  filename: prismaServicePath,
  loaded: true,
  exports: { PrismaService },
};
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
  assert(
    process.env.LANI_METADATA_TEST_DATABASE_URL,
    "Missing test database URL"
  );
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.LANI_METADATA_TEST_DATABASE_URL } },
    log: [{ emit: "event", level: "query" }],
  });
  let subtitleStatements = 0;
  prisma.$on("query", () => subtitleStatements++);
  const module = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot({
        driver: ApolloFederationDriver,
        autoSchemaFile: true,
        buildSchemaOptions: { orphanedTypes: [Torrent] },
      }),
    ],
    providers: [
      TorrentSubtitleResolver,
      Probe,
      { provide: PrismaService, useValue: prisma },
    ],
  }).compile();
  const api = module.createNestApplication();
  const data = postgraphile(
    process.env.LANI_METADATA_TEST_DATABASE_URL,
    "public",
    { dynamicJson: true, appendPlugins: [federation] }
  );
  let server;
  try {
    await prisma.$connect();
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
    const apiRequests = [];
    const gateway = new ApolloGateway({
      localServiceList,
      buildService: ({ name }) =>
        new (class extends LocalGraphQLDataSource {
          process(options) {
            if (name === "api" && options.request.variables?.representations) {
              apiRequests.push(options.request.variables.representations);
            }
            return super.process(options);
          }
        })(schemas[name]),
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
          "list should use one Data Server SQL query"
        );
        assert.equal(
          subtitleStatements,
          1,
          "subtitles should use one Prisma batch query"
        );
        assert.equal(apiRequests.length, 1);
        for (const representation of apiRequests[0]) {
          assert.deepEqual(Object.keys(representation).sort(), [
            "__typename",
            "nodeId",
          ]);
        }
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
      "Federated subtitles: composition, ID-only representations, aliases, legacy fallback, one list query and one subtitle batch query passed"
    );
  } finally {
    if (server) await server.stop();
    await data.release();
    await api.close();
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
