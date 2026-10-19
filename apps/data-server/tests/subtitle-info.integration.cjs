// 由隔离迁移测试提供临时数据库；不读取应用配置或连接共享环境。
const assert = require("node:assert/strict");
const { graphql } = require("graphql");
const { postgraphile, withPostGraphileContext } = require("postgraphile");
const plugin = require("../dist/subtitle-info-plugin").default;

async function main() {
  const app = postgraphile(
    process.env.LANI_METADATA_TEST_DATABASE_URL,
    "public",
    {
      dynamicJson: true,
      appendPlugins: [plugin],
    }
  );
  try {
    const schema = await app.getGraphQLSchema();
    async function query(source) {
      return withPostGraphileContext(
        { pgPool: app.pgPool },
        async (contextValue) => {
          let statements = 0;
          const original = contextValue.pgClient.query.bind(
            contextValue.pgClient
          );
          contextValue.pgClient.query = (...args) => {
            statements++;
            return original(...args);
          };
          try {
            const result = await graphql({ schema, source, contextValue });
            assert.equal(
              result.errors,
              undefined,
              JSON.stringify(result.errors)
            );
            assert.equal(
              statements,
              1,
              "each list or node query should use one SQL statement"
            );
            return result.data;
          } finally {
            contextValue.pgClient.query = original;
          }
        }
      );
    }
    const list = await query(
      "{ allTorrents(orderBy: ID_ASC) { nodes { id hash subtitleInfo alias: subtitleInfo } } }"
    );
    const byHash = Object.fromEntries(
      list.allTorrents.nodes.map((row) => [row.hash, row])
    );
    for (const row of list.allTorrents.nodes)
      assert.deepEqual(row.alias, row.subtitleInfo);
    assert.deepEqual(byHash["1"].subtitleInfo, {
      languages: ["en", "zh-Hant"],
      multi: true,
      delivery: ["muxed"],
    });
    assert.deepEqual(byHash["2"].subtitleInfo.languages, ["zh-Hans"]);
    assert.equal(byHash["7"].subtitleInfo, null);
    // 重新抓取失败仍展示上次成功的页面结果。
    const node = await query(
      `{ torrentById(id: ${byHash["1"].id}) { subtitleInfo } }`
    );
    assert.deepEqual(node.torrentById.subtitleInfo, byHash["1"].subtitleInfo);
    await app.pgPool.query(
      "UPDATE torrents SET parse_result = $1 WHERE hash = '1'",
      [
        {
          subtitleInfo: {
            languages: ["ja"],
            multi: false,
            delivery: ["external"],
          },
        },
      ]
    );
    const reparsed = await query(
      `{ torrentById(id: ${byHash["1"].id}) { subtitleInfo } }`
    );
    assert.deepEqual(reparsed.torrentById.subtitleInfo, {
      languages: ["en", "ja", "zh-Hant"],
      multi: true,
      delivery: ["external", "muxed"],
    });
    console.log(
      "Subtitle GraphQL list, alias, node, retained success and title reparse checks passed"
    );
  } finally {
    await app.release();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
