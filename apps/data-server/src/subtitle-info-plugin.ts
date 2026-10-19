import type { Plugin } from "graphile-build";
import { mergeSubtitleInfo } from "./subtitle-info";

// 元数据随当前行在同一次 SQL 查询中读取，不为列表逐行查询数据库。
const SubtitleInfoPlugin: Plugin = (builder) => {
  builder.hook("GraphQLObjectType:fields:field", (field, build, context) => {
    const { scope, addDataGenerator } = context;
    if (
      !scope.isPgRowType ||
      scope.pgFieldIntrospection?.name !== "torrents_subtitle_info"
    ) {
      return field;
    }
    const { pgSql: sql } = build;
    const key = "__subtitleMetadataResult";
    addDataGenerator(() => ({
      pgQuery(queryBuilder: any) {
        queryBuilder.select(
          sql.fragment`${queryBuilder.getTableAlias()}.${sql.identifier(
            "metadata_result"
          )}`,
          key
        );
      },
    }));
    const resolve = field.resolve!;
    return {
      ...field,
      async resolve(source, args, context, info) {
        return mergeSubtitleInfo(
          await resolve(source, args, context, info),
          (source as Record<string, unknown>)[key]
        );
      },
    };
  });
};

export default SubtitleInfoPlugin;
