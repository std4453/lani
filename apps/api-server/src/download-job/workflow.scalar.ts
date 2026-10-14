import { GraphQLScalarType, valueFromASTUntyped } from 'graphql';
import { parseWorkflow } from '@lani/download-workflow';

export const DownloadWorkflowScalar = new GraphQLScalarType({
  name: 'DownloadWorkflow',
  description: '版本化的任务流程快照；协议由 @lani/download-workflow 定义。',
  serialize: parseWorkflow,
  parseValue: parseWorkflow,
  parseLiteral: (node) => parseWorkflow(valueFromASTUntyped(node)),
});
