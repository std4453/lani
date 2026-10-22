import { GraphQLScalarType, valueFromASTUntyped } from 'graphql';

export const TaskSummaryScalar = new GraphQLScalarType({
  name: 'TaskSummary',
  description: '任务展示摘要的 JSON 快照；协议由 @lani/workflow 定义。',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (node, variables) => valueFromASTUntyped(node, variables),
});
